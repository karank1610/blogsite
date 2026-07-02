require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');

const authRoutes = require('./routes/authroutes.js');
const blogRoutes = require('./routes/blogroutes.js');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;