const router = require('express').Router();
const User = require('../models/User');

// Get nearby pharmacies
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000, openNow, isEmergency } = req.query;
    
    // In a real app with GeoJSON, we'd use $near or $geoNear.
    // Since we mock pharmacies, we will just return all pharmacies with 'role: pharmacy'
    // and manually append mock distance for UI demonstration purposes.
    
    let query = { role: 'pharmacy' };
    
    // We would filter by openNow or emergency here in a real DB
    // e.g. if (isEmergency === 'true') query.isEmergency = true;

    const pharmacies = await User.find(query).select('name email location');
    
    // Mocking distance, rating, and open status for UI
    const results = pharmacies.map(p => ({
      _id: p._id,
      name: p.name,
      location: p.location || { coordinates: [0, 0] },
      distance: (Math.random() * 5).toFixed(1), // mock distance in km
      rating: (Math.random() * 1 + 4).toFixed(1), // mock rating 4.0 - 5.0
      isOpen: Math.random() > 0.2, // 80% chance it's open
      isEmergency: Math.random() > 0.8, // 20% chance 24/7 emergency
    }));

    // Filter mocks if requested
    let filtered = results;
    if (openNow === 'true') filtered = filtered.filter(p => p.isOpen);
    if (isEmergency === 'true') filtered = filtered.filter(p => p.isEmergency);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
