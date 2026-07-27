const router = require('express').Router();
const User = require('../models/User');

// Get nearby pharmacies
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10, openNow, isEmergency } = req.query;
    
    let query = { role: 'pharmacy' };
    
    if (openNow === 'true') {
      query.isOpen = true;
    }
    if (isEmergency === 'true') {
      query.isEmergency = true;
    }

    if (lat && lng) {
      const radiusInRadians = Number(maxDistance) / 6378.1; // maxDistance in km
      query.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
        }
      };
    }

    const pharmacies = await User.find(query).select('name email location isOpen isEmergency');
    
    // Calculate actual distance for UI if lat/lng provided
    let results = pharmacies.map(p => {
        let distance = null;
        if (lat && lng && p.location && p.location.coordinates && p.location.coordinates.length === 2) {
             const [pLng, pLat] = p.location.coordinates;
             const R = 6371; 
             const dLat = (pLat - Number(lat)) * (Math.PI/180);
             const dLon = (pLng - Number(lng)) * (Math.PI/180);
             const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Number(lat) * (Math.PI/180)) * Math.cos(pLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
             distance = (R * c).toFixed(1);
        }
        
        return {
          _id: p._id,
          name: p.name,
          location: p.location,
          coords: p.location?.coordinates ? [p.location.coordinates[1], p.location.coordinates[0]] : [0, 0], // format to [lat, lng] for frontend
          distance: distance || 'Unknown',
          rating: '4.5', // Mock rating
          isOpen: p.isOpen,
          isEmergency: p.isEmergency,
        };
    });

    if (lat && lng) {
        // sort by distance
        results.sort((a, b) => {
          if (a.distance === 'Unknown') return 1;
          if (b.distance === 'Unknown') return -1;
          return Number(a.distance) - Number(b.distance);
        });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
