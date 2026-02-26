const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function hashPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (!user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`✅ Hashed password for: ${user.email}`);
      } else {
        console.log(`⏭️  Already hashed: ${user.email}`);
      }
    }

    console.log('\n✅ All passwords processed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

hashPasswords();
