// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// your route requires (example)
const authRoutes = require('./routes/auth'); // adjust paths if different
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin'); // if exists

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.get("/health",(req,res)=>{
    res.send("WORKING")
})

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reporting', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// create http server and attach socket.io
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*', // set to your client URL in production
    methods: ['GET', 'POST'],
  },
});

// Optionally log connections
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // you can handle rooms, authentication on socket here if you want
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// make io available in express handlers
app.set('io', io);

// listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, server };
