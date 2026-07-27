const router = require('express').Router();
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all medicines for the logged-in pharmacy
router.get('/', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const medicines = await Medicine.find({ pharmacyId: req.user.id });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new medicine to inventory
router.post('/', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const pharmacy = await User.findById(req.user.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    const newMedicine = new Medicine({
      ...req.body,
      pharmacyId: req.user.id,
      pharmacyName: pharmacy.name,
      location: pharmacy.location
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a medicine (stock, price, etc.)
router.put('/:id', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, pharmacyId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found or unauthorized' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a medicine
router.delete('/:id', auth, authorize(['pharmacy']), async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, pharmacyId: req.user.id });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found or unauthorized' });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
