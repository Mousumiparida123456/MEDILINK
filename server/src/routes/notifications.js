const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    // Add _id for frontend compatibility
    res.json(notifications.map(n => ({ ...n, _id: n.id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notif) return res.status(404).json({ message: 'Not found' });
    if (notif.userId !== req.user.id) return res.status(403).json({ message: 'Denied' });
    
    const updatedNotif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    
    res.json({ ...updatedNotif, _id: updatedNotif.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
