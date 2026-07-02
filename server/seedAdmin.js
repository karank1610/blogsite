require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const username = 'admin'; 
  const plainPassword = 'admin123'; 

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await Admin.create({ username, password: hashedPassword });

  console.log('Admin created successfully');
  process.exit();
};

createAdmin();