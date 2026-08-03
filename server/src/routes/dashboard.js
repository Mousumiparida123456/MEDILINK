const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize(['pharmacy', 'admin']), async (req, res) => {
  try {
    const pharmacyId = req.user.id;

    // 1. Total Medicines
    const totalMedicines = await prisma.medicine.count({ where: { pharmacyId } });

    // 2. Low Stock Alerts
    const lowStock = await prisma.medicine.findMany({
      where: { pharmacyId, quantity: { lt: 10 } },
      select: { brandName: true, inStock: true, quantity: true }
    });

    // Format output to match old frontend schema slightly if needed
    const formattedLowStock = lowStock.map(item => ({
      brandName: item.brandName,
      stockAvailability: {
        inStock: item.inStock,
        quantity: item.quantity
      }
    }));

    // 3. Today's Reservations
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysReservations = await prisma.reservation.count({
      where: {
        pharmacyId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 4. Mock Revenue Chart Data
    const revenueData = [
      { name: 'Mon', revenue: 400 },
      { name: 'Tue', revenue: 300 },
      { name: 'Wed', revenue: 550 },
      { name: 'Thu', revenue: 450 },
      { name: 'Fri', revenue: 700 },
      { name: 'Sat', revenue: 900 },
      { name: 'Sun', revenue: 850 },
    ];

    res.json({
      totalMedicines,
      todaysReservations,
      lowStockCount: formattedLowStock.length,
      lowStockItems: formattedLowStock,
      revenueData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
