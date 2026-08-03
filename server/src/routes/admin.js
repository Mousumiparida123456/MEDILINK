const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');

// Helper to remove password
const excludePassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get all users
router.get('/users', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.map(excludePassword));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pharmacies
router.get('/pharmacies', auth, authorize(['admin']), async (req, res) => {
  try {
    const pharmacies = await prisma.user.findMany({
      where: { role: 'pharmacy' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pharmacies.map(excludePassword));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get platform stats
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    const totalPharmacies = await prisma.user.count({ where: { role: 'pharmacy' } });
    const totalReservations = await prisma.reservation.count();
    
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
    const user = await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update user status (verify/ban)
router.patch('/users/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { isVerified, isBanned } = req.body;
    
    const data = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (isBanned !== undefined) data.isBanned = isBanned;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(excludePassword(user));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
