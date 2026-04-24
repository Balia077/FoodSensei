const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const foodRoutes = require('./routes/food.routes');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: [
    "http://localhost:5173",
    "https://your-app.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// app.get('/', (req, res) => {
//   res.send("Backend is running 🚀");
// });

app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);

app.use('/api/food', foodRoutes);

module.exports = app;