# Epic 5 - Quick Start Guide

## 🎯 What We Implemented

Epic 5 provides **deterministic payment simulation** with three outcomes:

- ✅ **Success**: Booking confirmed, lock consumed
- ❌ **Failure**: Booking failed, seats released
- ⏱️ **Timeout**: Payment pending, job handles it later (Epic 6)

---

## 🚀 Getting Started

### 1. Start the Server

```bash
npm run dev
```

### 2. Full Workflow (Postman/cURL)

#### Step A: Create User

```bash
POST http://localhost:3000/api/users/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "pass123"
}
```

Save the `_id` → USER_ID

#### Step B: Create Event

```bash
POST http://localhost:3000/api/events
{
  "name": "JavaScript Summit",
  "description": "Annual JS Conference",
  "eventDate": "2026-06-15T10:00:00Z",
  "totalSeats": 100,
  "availableSeats": 100
}
```

Save the `_id` → EVENT_ID

#### Step C: Lock Seats

```bash
POST http://localhost:3000/api/locks
{
  "eventId": "EVENT_ID",
  "userId": "USER_ID",
  "seats": 3,
  "idempotencyKey": "unique-lock-123"
}
```

Save the `_id` → LOCK_ID

#### Step D: Create Booking

```bash
POST http://localhost:3000/api/bookings/LOCK_ID/confirm
```

Response contains `_id` → BOOKING_ID

---

## 💳 Test Payment Flows

### ✅ Test 1: Success Payment

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "BOOKING_ID",
  "force": "success"
}
```

**Expected Results**:

- ✅ HTTP 200 OK
- ✅ `paymentStatus: "SUCCESS"`
- ✅ Booking now shows `status: "CONFIRMED"`
- ✅ SeatLock now shows `status: "CONSUMED"`
- ✅ Event.availableSeats = 97 (100 - 3 locked)

**Database Check**:

```javascript
// Check Booking
db.bookings.findOne({ _id: ObjectId("BOOKING_ID") });
// Should show: status: "CONFIRMED"

// Check SeatLock
db.seatlocks.findOne({ _id: ObjectId("LOCK_ID") });
// Should show: status: "CONSUMED"

// Check Event
db.events.findOne({ _id: ObjectId("EVENT_ID") });
// Should show: availableSeats: 97
```

---

### ❌ Test 2: Failed Payment

Create another booking (repeat Steps C-D), then:

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "BOOKING_ID_2",
  "force": "failure"
}
```

**Expected Results**:

- ✅ HTTP 200 OK
- ✅ `paymentStatus: "FAILED"`
- ✅ Booking now shows `status: "FAILED"`
- ✅ SeatLock now shows `status: "EXPIRED"`
- ✅ Event.availableSeats = 100 (seats restored!)

**Database Check**:

```javascript
// Check Booking
db.bookings.findOne({ _id: ObjectId("BOOKING_ID_2") });
// Should show: status: "FAILED"

// Check SeatLock
db.seatlocks.findOne({ _id: ObjectId("LOCK_ID_2") });
// Should show: status: "EXPIRED"

// Check Event
db.events.findOne({ _id: ObjectId("EVENT_ID") });
// Should show: availableSeats: 100 (all seats back!)
```

---

### ⏱️ Test 3: Timeout Payment

Create another booking (repeat Steps C-D), then:

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "BOOKING_ID_3",
  "force": "timeout"
}
```

**Expected Results**:

- ✅ HTTP 200 OK
- ✅ `paymentStatus: "TIMEOUT"`
- ✅ Booking status **remains** `"PAYMENT_PENDING"`
- ✅ SeatLock status **remains** `"ACTIVE"`
- ✅ Event.availableSeats **remains** 97

**Database Check**:

```javascript
// Check Booking
db.bookings.findOne({ _id: ObjectId("BOOKING_ID_3") });
// Should show: status: "PAYMENT_PENDING" (UNCHANGED!)

// Check SeatLock
db.seatlocks.findOne({ _id: ObjectId("LOCK_ID_3") });
// Should show: status: "ACTIVE" (UNCHANGED!)

// Check Event
db.events.findOne({ _id: ObjectId("EVENT_ID") });
// Should show: availableSeats: 97 (UNCHANGED!)
```

_(Epic 6 will auto-expire these later)_

---

## ❌ Test Error Cases

### Invalid Booking ID

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "invalid_id_123",
  "force": "success"
}
```

Expected: **404 Not Found**

### Booking Not in PAYMENT_PENDING

First confirm a payment (success), then try to pay again:

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "BOOKING_ID",  // Already CONFIRMED
  "force": "success"
}
```

Expected: **400 Bad Request** - "Payment not allowed in CONFIRMED state"

### Missing Fields

```bash
POST http://localhost:3000/api/payments/intent
{
  "force": "success"
  // Missing: bookingId
}
```

Expected: **400 Bad Request** - "bookingId and force are required"

### Invalid Force Value

```bash
POST http://localhost:3000/api/payments/intent
{
  "bookingId": "BOOKING_ID",
  "force": "maybe"  // Invalid!
}
```

Expected: **400 Bad Request** - "force must be success | failure | timeout"

---

## 📊 Key Behaviors

| Scenario    | Booking Status                  | Lock Status            | Seats Change |
| ----------- | ------------------------------- | ---------------------- | ------------ |
| **Success** | PAYMENT_PENDING → **CONFIRMED** | ACTIVE → **CONSUMED**  | No change    |
| **Failure** | PAYMENT_PENDING → **FAILED**    | ACTIVE → **EXPIRED**   | **Restored** |
| **Timeout** | **PAYMENT_PENDING** (no change) | **ACTIVE** (no change) | No change    |

---

## 🔄 Transaction Guarantee

All operations are **atomic transactions**:

```
START TRANSACTION
├─ Update booking status
├─ Update lock status
├─ Update event seats (if failure)
COMMIT (all succeed) OR ROLLBACK (all fail)
```

❌ **No partial updates** - Either everything succeeds or nothing does

---

## 🐛 Troubleshooting

### "Booking not found"

- Check BOOKING_ID is correct
- Verify booking exists: `db.bookings.findOne({_id: ObjectId("BOOKING_ID")})`

### "Payment not allowed in PAYMENT_PENDING state"

- Status should be PAYMENT_PENDING
- Try payment immediately after creating booking

### "Seats not restored on failure"

- Check SeatLock has valid eventId
- Verify Event exists: `db.events.findOne({_id: ObjectId("EVENT_ID")})`
- Check that SeatLock.status changed to "EXPIRED"

### "Transaction timed out"

- Check MongoDB is running
- Check no locks on collections
- Try again

---

## 📝 Code Structure

```
src/
├── controllers/
│   └── payment.controller.js          ← All 3 tasks implemented here
│       ├── createPaymentIntent()      ← Task 5.1
│       ├── handlePaymentSuccess()     ← Task 5.2
│       └── handlePaymentFailure()     ← Task 5.3
│
├── services/
│   └── bookingConfirmation.service.js ← Updated for Epic 5
│       └── confirmBookingTransactional()
│
├── routes/
│   └── payment.routes.js              ← POST /api/payments/intent
│
└── models/
    ├── Booking.model.js
    ├── SeatLock.model.js
    ├── Event.model.js
    └── User.model.js
```

---

## ✅ Checklist for Complete Testing

- [ ] Server starts without errors
- [ ] Can create user
- [ ] Can create event with 100 seats
- [ ] Can lock seats (availableSeats decreases)
- [ ] Can create booking (status = PAYMENT_PENDING)
- [ ] Payment success: booking → CONFIRMED, seats locked
- [ ] Payment failure: booking → FAILED, seats restored
- [ ] Payment timeout: status unchanged, seats locked
- [ ] Error cases return proper HTTP codes
- [ ] Database shows correct state after each operation

---

## 🎓 What You've Learned

✅ **MongoDB Transactions** - All-or-nothing operations
✅ **State Machine** - Valid transitions (PAYMENT_PENDING → CONFIRMED/FAILED/EXPIRED)
✅ **Atomic Operations** - Booking + Lock + Event updated together
✅ **Resource Management** - Seats locked on success, released on failure
✅ **Error Handling** - Proper HTTP codes and error messages

---

## 🚀 Next: Epic 6

Epic 6 adds background jobs to handle:

- **Lock Expiry** - Auto-expire ACTIVE locks after 5 minutes
- **Booking Expiry** - Auto-expire PAYMENT_PENDING bookings after 10 minutes
- **Failure Recovery** - Handle crashes gracefully

This means TIMEOUT payments will be automatically cleaned up!

---

## 📞 Need Help?

1. Check the detailed guide: `EPIC5_PAYMENT_SIMULATION.md`
2. Review the summary: `EPIC5_COMPLETE.md`
3. Check MongoDB for actual data state
4. Review error messages carefully
5. Verify each step before moving to next

Happy testing! 🎉
