# Epic 5: Payment Simulation - Implementation Guide

## Overview

Epic 5 implements payment simulation with three core functionalities:

- **TASK 5.1**: Payment Intent API - Simulates payment responses
- **TASK 5.2**: Payment Success Flow - Confirms booking and consumes lock
- **TASK 5.3**: Payment Failure Flow - Handles payment failure and releases seats

---

## Implementation Details

### Architecture Flow

```
Seat Lock Created (Epic 3)
         ↓
    Create Booking (Epic 4)
         ↓
   PAYMENT_PENDING State
         ↓
    Payment Intent API (Task 5.1)
    ↙         ↓         ↘
 success   failure    timeout
    ↓         ↓          ↓
  5.2       5.3        (expiry job)
    ↓         ↓          ↓
CONFIRMED  FAILED     EXPIRED
```

---

## TASK 5.1: Payment Intent API

**Endpoint**: `POST /api/payments/intent`

**Request Body**:

```json
{
  "bookingId": "booking_id_here",
  "force": "success" | "failure" | "timeout"
}
```

**Responses**:

### Success Response (force: "success")

```json
{
  "success": true,
  "paymentStatus": "SUCCESS",
  "message": "Payment successful and booking confirmed",
  "booking": {
    "id": "booking_id",
    "status": "CONFIRMED",
    "event": "event_id",
    "user": "user_id",
    "seats": 2
  }
}
```

### Failure Response (force: "failure")

```json
{
  "success": true,
  "paymentStatus": "FAILED",
  "message": "Payment failed and seats have been released",
  "booking": {
    "id": "booking_id",
    "status": "FAILED",
    "event": "event_id",
    "user": "user_id"
  }
}
```

### Timeout Response (force: "timeout")

```json
{
  "success": true,
  "paymentStatus": "TIMEOUT",
  "message": "Payment timed out (simulated)"
}
```

---

## TASK 5.2: Payment Success Flow

**What Happens**:

1. ✅ Validates booking exists and is in PAYMENT_PENDING state
2. ✅ Updates booking status to CONFIRMED
3. ✅ Marks seat lock as CONSUMED (prevents double-use)
4. ✅ Uses MongoDB transactions for atomicity

**Acceptance Criteria Met**:

- ✅ Seat lock is consumed
- ✅ Booking marked CONFIRMED
- ✅ Atomic transaction ensures consistency

**Implementation**: [payment.controller.js](src/controllers/payment.controller.js#L89-L144)

---

## TASK 5.3: Payment Failure Flow

**What Happens**:

1. ✅ Validates booking exists and is in PAYMENT_PENDING state
2. ✅ Updates booking status to FAILED
3. ✅ Releases locked seats back to Event.availableSeats
4. ✅ Marks seat lock as EXPIRED (prevents recovery)
5. ✅ Uses MongoDB transactions for atomicity

**Acceptance Criteria Met**:

- ✅ Seats are released
- ✅ Booking marked FAILED
- ✅ Atomic transaction ensures consistency

**Implementation**: [payment.controller.js](src/controllers/payment.controller.js#L146-L207)

---

## Code Changes Summary

### 1. Updated Payment Controller

**File**: `src/controllers/payment.controller.js`

**Key Changes**:

- Added `handlePaymentSuccess()` function with transactional logic
- Added `handlePaymentFailure()` function with seat release logic
- Integrated SeatLock consumption on success
- Integrated Event.availableSeats restoration on failure

**Dependencies Added**:

```javascript
const SeatLock = require("../models/SeatLock.model");
const Event = require("../models/Event.model");
const mongoose = require("mongoose");
```

### 2. Updated Booking Confirmation Service

**File**: `src/services/bookingConfirmation.service.js`

**Key Changes**:

- Kept seat lock ACTIVE (not deleted) during booking creation
- Lock will be consumed/expired by payment handler
- Added seat release on lock expiry check

---

## Testing Workflow

### Step 1: Create User

```bash
POST http://localhost:3000/api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "pass123"
}
```

### Step 2: Create Event

```bash
POST http://localhost:3000/api/events
{
  "name": "Tech Conference 2026",
  "description": "Annual tech conference",
  "eventDate": "2026-06-15T10:00:00Z",
  "totalSeats": 100,
  "availableSeats": 100
}
```

### Step 3: Lock Seats

```bash
POST http://localhost:3000/api/locks
{
  "eventId": "event_id_from_step2",
  "userId": "user_id_from_step1",
  "seats": 2,
  "idempotencyKey": "unique-key-123"
}
```

### Step 4: Confirm Booking

```bash
POST http://localhost:3000/api/bookings/:lockId/confirm
{
  "lockId": "lock_id_from_step3"
}
```

Response:

```json
{
  "success": true,
  "booking": {
    "_id": "booking_id",
    "status": "PAYMENT_PENDING",
    "event": "event_id",
    "user": "user_id",
    "seatLockId": "lock_id"
  }
}
```

### Step 5A: Test Payment Success

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "booking_id_from_step4",
  "force": "success"
}
```

Expected:

- Booking status → CONFIRMED
- SeatLock status → CONSUMED
- availableSeats remains reduced

### Step 5B: Test Payment Failure

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "booking_id_from_step4",
  "force": "failure"
}
```

Expected:

- Booking status → FAILED
- SeatLock status → EXPIRED
- availableSeats restored (+2)
- Event has same seats as before

### Step 5C: Test Payment Timeout

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "booking_id_from_step4",
  "force": "timeout"
}
```

Expected:

- Booking remains PAYMENT_PENDING
- Expiry job will handle later (Epic 6)

---

## State Transitions

### Valid Transitions:

```
INITIATED → PAYMENT_PENDING → CONFIRMED
                           → FAILED
                           → CANCELLED
                           → EXPIRED

Terminal States: CONFIRMED, FAILED, CANCELLED, EXPIRED
```

### Atomic Operations:

All state transitions are wrapped in MongoDB sessions:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
// ... update multiple documents ...
await session.commitTransaction();
```

---

## Data Consistency Guarantees

### Payment Success:

1. ✅ Booking transitioned to CONFIRMED
2. ✅ SeatLock marked CONSUMED
3. ✅ Seats remain unavailable (locked-in)
4. ✅ No duplicate payments possible (single status transition)

### Payment Failure:

1. ✅ Booking transitioned to FAILED
2. ✅ SeatLock marked EXPIRED
3. ✅ Seats restored to Event.availableSeats
4. ✅ No negative seats (validated in Event model)
5. ✅ No duplicate failures (single status transition)

### Error Handling:

- Transaction rollback on any error
- Consistent error responses
- No partial writes possible

---

## Integration with Other Epics

### Epic 3 (Seat Locking):

- Produces SeatLock required by payment flow
- Lock status managed by payment handlers

### Epic 4 (Booking Flow):

- Creates PAYMENT_PENDING booking
- Links booking to SeatLock

### Epic 6 (Expiry & Recovery):

- Handles TIMEOUT case
- Expires unpaid bookings
- Recovers from failed payments

### Epic 7 (Transactions):

- Uses MongoDB transactions for consistency
- Prevents race conditions

---

## Troubleshooting

### Issue: "Booking not found"

- Ensure booking was created in Epic 4
- Verify correct bookingId

### Issue: "Payment not allowed in X state"

- Only PAYMENT_PENDING bookings accept payment
- Check booking status before payment

### Issue: "Seats not restored on failure"

- Verify SeatLock.eventId is populated
- Check Event.availableSeats constraints

### Issue: "Duplicate confirmations"

- State transitions prevent re-confirmation
- Only CONFIRMED state is valid once

---

## Next Steps: Epic 6

Epic 6 will handle:

- **TASK 6.1**: Lock Expiry Worker - Auto-expire stale locks
- **TASK 6.2**: Booking Expiry Worker - Auto-expire unpaid bookings
- **TASK 6.3**: Failure Recovery Logic - Recover from crashes

These workers will catch TIMEOUT payments and abandoned bookings.

---

## Production Checklist

- [ ] Add authentication middleware
- [ ] Add rate limiting on payment endpoint
- [ ] Add idempotency key to prevent duplicate payments
- [ ] Add audit logging for all state transitions
- [ ] Add retry logic for transient failures
- [ ] Add monitoring for payment timeouts
- [ ] Add alerting for payment failures
- [ ] Add database backups
- [ ] Load test concurrent payments
