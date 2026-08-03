const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');

// Get all medicines for the logged-in pharmacy
router.get('/', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { pharmacyId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    // Add _id for frontend compatibility
    res.json(medicines.map(m => ({ ...m, _id: m.id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new medicine to inventory
router.post('/', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const pharmacy = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    const newMedicine = await prisma.medicine.create({
      data: {
        ...req.body,
        pharmacyId: req.user.id,
        pharmacyName: pharmacy.name,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude
      }
    });

    res.status(201).json({ ...newMedicine, _id: newMedicine.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a medicine (stock, price, etc.)
router.put('/:id', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const existing = await prisma.medicine.findFirst({
      where: { id: req.params.id, pharmacyId: req.user.id }
    });
    if (!existing) return res.status(404).json({ message: 'Medicine not found or unauthorized' });

    const updatedMedicine = await prisma.medicine.update({
      where: { id: existing.id },
      data: req.body
    });
    
    res.json({ ...updatedMedicine, _id: updatedMedicine.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a medicine
router.delete('/:id', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const existing = await prisma.medicine.findFirst({
      where: { id: req.params.id, pharmacyId: req.user.id }
    });
    if (!existing) return res.status(404).json({ message: 'Medicine not found or unauthorized' });

    await prisma.medicine.delete({
      where: { id: existing.id }
    });
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
