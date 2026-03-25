require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
// CONFIG: Set these to what you want to login with
const TARGET_EMAIL = 'anuragverma71535@gmail.com';
const TARGET_PASSWORD = 'Anurag12345'; // Put your actual password here
// ============================================

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // List all users
  const allUsers = await usersCollection.find({}).toArray();
  console.log(`\n=== USERS IN DATABASE (${allUsers.length} total) ===`);
  allUsers.forEach((u, i) => {
    console.log(`[${i+1}] email="${u.email}" | username="${u.username}" | verified=${u.isEmailVerified} | hasPassword=${!!u.password}`);
  });

  // Check if target email exists
  const existingUser = await usersCollection.findOne({ email: TARGET_EMAIL });
  if (existingUser) {
    console.log(`\n✅ User with email "${TARGET_EMAIL}" EXISTS.`);
    console.log(`   Username: ${existingUser.username}`);
    console.log(`   Verified: ${existingUser.isEmailVerified}`);
    
    // Reset password and ensure verified
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(TARGET_PASSWORD, salt);
    await usersCollection.updateOne(
      { email: TARGET_EMAIL },
      { $set: { password: hash, isEmailVerified: true } }
    );
    console.log(`\n✅ Password has been reset and account is marked as verified!`);
    console.log(`   Login with: ${TARGET_EMAIL} / ${TARGET_PASSWORD}`);
  } else {
    console.log(`\n❌ User "${TARGET_EMAIL}" NOT FOUND.`);
    if (allUsers.length > 0) {
      console.log(`\n⚠️  The account in DB has a DIFFERENT email.`);
      console.log(`    Use one of the emails listed above to login.`);
      
      // Fix the first user's email to the target email and reset password
      const firstUser = allUsers[0];
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(TARGET_PASSWORD, salt);
      await usersCollection.updateOne(
        { _id: firstUser._id },
        { $set: { email: TARGET_EMAIL, password: hash, isEmailVerified: true } }
      );
      console.log(`\n✅ FIXED! Updated user "${firstUser.username}":`);
      console.log(`   Old email: ${firstUser.email}`);
      console.log(`   New email: ${TARGET_EMAIL}`);
      console.log(`   Password set to: ${TARGET_PASSWORD}`);
      console.log(`\n   You can now login with: ${TARGET_EMAIL} / ${TARGET_PASSWORD}`);
    } else {
      console.log(`\n❌ Database is EMPTY. Please sign up from the app.`);
    }
  }

  mongoose.disconnect();
  console.log('\nDone. Restart backend and try logging in.');
}).catch(err => console.error('DB Error:', err.message));
