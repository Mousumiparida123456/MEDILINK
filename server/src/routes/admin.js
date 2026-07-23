const router = require('express').Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const { auth, authorize } = require('../middleware/auth');

// Get all users
router.get('/users', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pharmacies
router.get('/pharmacies', auth, authorize(['admin']), async (req, res) => {
  try {
    const pharmacies = await User.find({ role: 'pharmacy' }).select('-password').sort('-createdAt');
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get platform stats
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPharmacies = await User.countDocuments({ role: 'pharmacy' });
    const totalReservations = await Reservation.countDocuments();
    
    // Revenue mock - in real app would aggregate completed reservations * medicine price
    const platformRevenue = 15400; 

    res.json({
      totalUsers,
      totalPharmacies,
      totalReservations,
      platformRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user or pharmacy
router.delete('/users/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status (verify/ban)
router.patch('/users/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { isVerified, isBanned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isBanned !== undefined) user.isBanned = isBanned;
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
