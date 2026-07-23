const router = require('express').Router();
const Medicine = require('../models/Medicine');

// Search Medicines
// Query params: q (search term), type (generic, brand, disease), maxPrice, maxDistance (if location given), inStock (boolean)
router.get('/search', async (req, res) => {
  try {
    const { q, maxPrice, inStock, limit = 20 } = req.query;

    let query = {};

    // Text search if query provided
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    if (inStock === 'true') {
      query['stockAvailability.inStock'] = true;
    }

    const medicines = await Medicine.find(query)
      .limit(Number(limit))
      .populate('pharmacyId', 'name email');

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-suggest (simple regex match for typeahead)
router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const suggestions = await Medicine.find({
      $or: [
        { brandName: regex },
        { genericName: regex },
        { diseaseTags: regex }
      ]
    }).limit(5).select('brandName genericName');

    // Flatten and unique suggestions
    const results = suggestions.map(s => s.brandName).concat(suggestions.map(s => s.genericName));
    const unique = [...new Set(results)].slice(0, 5);

    res.json(unique);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
