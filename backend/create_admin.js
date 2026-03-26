require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TARGET_EMAIL = 'admin@socialmern.com';
const TARGET_USERNAME = 'admin';
const TARGET_PASSWORD = 'AdminPassword123!';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  const existing = await usersCollection.findOne({ email: TARGET_EMAIL });
  if (existing) {
    console.log(`Admin user ${TARGET_EMAIL} already exists!`);
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(TARGET_PASSWORD, salt);

  await usersCollection.insertOne({
    username: TARGET_USERNAME,
    email: TARGET_EMAIL,
    password: hash,
    role: 'admin',
    name: 'System Admin',
    isEmailVerified: true,
    isActive: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Admin account created successfully!');
  console.log(`Email: ${TARGET_EMAIL}`);
  console.log(`Password: ${TARGET_PASSWORD}`);
  
  await mongoose.disconnect();
}).catch(err => console.error(err));
