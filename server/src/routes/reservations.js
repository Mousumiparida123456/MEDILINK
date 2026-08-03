const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
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
    const parsedQuantity = Number(quantity) || 1;
    
    // Check medicine stock
    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine || medicine.quantity < parsedQuantity) {
      return res.status(400).json({ message: 'Insufficient stock or medicine not found' });
    }

    const qrCodeToken = crypto.randomBytes(16).toString('hex');
    const prescriptionUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const reservation = await prisma.reservation.create({
      data: {
        userId: req.user.id,
        pharmacyId,
        medicineId,
        quantity: parsedQuantity,
        pickupTime: new Date(pickupTime),
        prescriptionUrl,
        qrCodeToken
      }
    });

    // Deduct stock temporarily (basic logic)
    const newQuantity = medicine.quantity - parsedQuantity;
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        quantity: newQuantity,
        inStock: newQuantity > 0
      }
    });

    // Send Reservation Confirmation Email
    sendEmail(
      req.user.email,
      'Reservation Confirmed - MediLink',
      `<h2>Reservation Confirmed!</h2>
       <p>You have successfully reserved <b>${parsedQuantity}x ${medicine.brandName}</b>.</p>
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
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user.id },
      include: {
        medicine: { select: { brandName: true, genericName: true, price: true } },
        pharmacy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map output to match frontend expectations (medicineId becomes the populated object)
    const formattedReservations = reservations.map(r => ({
      ...r,
      _id: r.id,
      medicineId: r.medicine,
      pharmacyId: r.pharmacy
    }));
    
    res.json(formattedReservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reservation status (Pharmacy only)
router.patch('/:id/status', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const { status } = req.body;
    let reservation = await prisma.reservation.findFirst({
      where: { id: req.params.id, pharmacyId: req.user.id },
      include: { medicine: true }
    });
      
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    
    reservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status }
    });
    
    // Notification logic
    const patientUser = await prisma.user.findUnique({ where: { id: reservation.userId } });
    if (patientUser) {
      const message = `Your reservation for ${reservation.medicine.brandName} has been ${status}.`;
      
      await prisma.notification.create({
        data: {
          userId: patientUser.id,
          title: 'Reservation Update',
          message: message,
          type: 'reservation_status'
        }
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
