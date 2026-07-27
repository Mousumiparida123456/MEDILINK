const router = require('express').Router();
const Medicine = require('../models/Medicine');

// Search Medicines
// Query params: q (search term), lat, lng, maxDistance (in km), maxPrice, inStock (boolean)
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng, maxDistance = 10, maxPrice, inStock, limit = 20 } = req.query;

    let query = {};

    // Text search if query provided
    if (q) {
      query.$text = { $search: q };
    }

    // Location based search
    if (lat && lng) {
      const radiusInRadians = Number(maxDistance) / 6378.1; // km to radians
      // Using $geoWithin instead of $near to avoid index conflicts with $text
      query.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
        }
      };
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
      .populate('pharmacyId', 'name email location');
      
    // Calculate distance for UI if lat/lng provided
    let results = medicines.map(m => {
        let distance = null;
        if (lat && lng && m.location && m.location.coordinates && m.location.coordinates.length === 2) {
             const [mLng, mLat] = m.location.coordinates;
             // simple haversine in js
             const R = 6371; 
             const dLat = (mLat - Number(lat)) * (Math.PI/180);
             const dLon = (mLng - Number(lng)) * (Math.PI/180);
             const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Number(lat) * (Math.PI/180)) * Math.cos(mLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
             distance = R * c;
        }
        return { ...m.toObject(), distance };
    });
    
    if (lat && lng) {
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    res.json(results);
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

// Get generic alternatives
router.get('/generic/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    const alternatives = await Medicine.find({
        genericName: medicine.genericName,
        _id: { $ne: medicine._id }
    }).limit(5).populate('pharmacyId', 'name');
    
    res.json(alternatives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('pharmacyId', 'name email location');
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
