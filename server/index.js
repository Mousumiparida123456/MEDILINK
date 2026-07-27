require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const medicineRoutes = require('./src/routes/medicines');
const pharmacyRoutes = require('./src/routes/pharmacies');
const reservationRoutes = require('./src/routes/reservations');
const dashboardRoutes = require('./src/routes/dashboard');
const adminRoutes = require('./src/routes/admin');
const reviewRoutes = require('./src/routes/reviews');
const notificationRoutes = require('./src/routes/notifications');
const optimizerRoutes = require('./src/routes/optimizer');
const inventoryRoutes = require('./src/routes/inventory');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/inventory', inventoryRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
