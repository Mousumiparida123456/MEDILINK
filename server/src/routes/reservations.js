const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Reservation = require('../models/Reservation');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

// Setup Multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create a reservation
router.post('/', auth, upload.single('prescription'), async (req, res) => {
  try {
    const { pharmacyId, medicineId, quantity, pickupTime } = req.body;
    
    // Check medicine stock
    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.stockAvailability.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock or medicine not found' });
    }

    const qrCodeToken = crypto.randomBytes(16).toString('hex');
    const prescriptionUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const reservation = new Reservation({
      userId: req.user.id,
      pharmacyId,
      medicineId,
      quantity,
      pickupTime,
      prescriptionUrl,
      qrCodeToken
    });

    await reservation.save();

    // Deduct stock temporarily (basic logic)
    medicine.stockAvailability.quantity -= quantity;
    if (medicine.stockAvailability.quantity === 0) medicine.stockAvailability.inStock = false;
    await medicine.save();

    // Send Reservation Confirmation Email
    sendEmail(
      req.user.email,
      'Reservation Confirmed - MediLink',
      `<h2>Reservation Confirmed!</h2>
       <p>You have successfully reserved <b>${quantity}x ${medicine.brandName}</b>.</p>
       <p>Please present this QR Code token at the pharmacy: <strong>${qrCodeToken}</strong></p>
       <p>Pickup time: ${new Date(pickupTime).toLocaleString()}</p>`
    ).catch(console.error);

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id })
      .populate('medicineId', 'brandName genericName price')
      .populate('pharmacyId', 'name')
      .sort('-createdAt');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reservation status (Pharmacy only)
router.patch('/:id/status', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findOne({ _id: req.params.id, pharmacyId: req.user.id })
      .populate('medicineId');
      
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    
    reservation.status = status;
    await reservation.save();
    
    // Notification logic
    const patientUser = await User.findById(reservation.userId);
    if (patientUser) {
      const message = `Your reservation for ${reservation.medicineId.brandName} has been ${status}.`;
      
      await Notification.create({
        userId: patientUser._id,
        title: 'Reservation Update',
        message: message,
        type: 'reservation_status'
      });
      
      // Send Email
      if (status === 'confirmed' || status === 'cancelled') {
        sendEmail(
          patientUser.email,
          `Reservation ${status.toUpperCase()} - MediLink`,
          `<h2>Reservation Update</h2><p>${message}</p>`
        ).catch(console.error);
      }
    }
    
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
