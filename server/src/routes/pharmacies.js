const router = require('express').Router();
const prisma = require('../utils/prisma');

// Get nearby pharmacies
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10, openNow, isEmergency } = req.query;
    
    let where = { role: 'pharmacy' };
    
    if (openNow === 'true') {
      where.isOpen = true;
    }
    if (isEmergency === 'true') {
      where.isEmergency = true;
    }

    let pharmacies = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, latitude: true, longitude: true, isOpen: true, isEmergency: true }
    });
    
    // Calculate actual distance for UI if lat/lng provided
    if (lat && lng) {
      pharmacies = pharmacies.map(p => {
        let distance = null;
        if (p.latitude != null && p.longitude != null) {
          const pLat = p.latitude;
          const pLng = p.longitude;
          const R = 6371; 
          const dLat = (pLat - Number(lat)) * (Math.PI/180);
          const dLon = (pLng - Number(lng)) * (Math.PI/180);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Number(lat) * (Math.PI/180)) * Math.cos(pLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = (R * c).toFixed(1);
        }
        
        return {
          _id: p.id,
          name: p.name,
          location: { type: 'Point', coordinates: [p.longitude || 0, p.latitude || 0] },
          coords: [p.latitude || 0, p.longitude || 0], // format to [lat, lng] for frontend
          distance: distance || 'Unknown',
          rating: '4.5', // Mock rating
          isOpen: p.isOpen,
          isEmergency: p.isEmergency,
        };
      });

      // Filter by maxDistance if calculated
      pharmacies = pharmacies.filter(p => p.distance === 'Unknown' || Number(p.distance) <= Number(maxDistance));

      // sort by distance
      pharmacies.sort((a, b) => {
        if (a.distance === 'Unknown') return 1;
        if (b.distance === 'Unknown') return -1;
        return Number(a.distance) - Number(b.distance);
      });
    } else {
      // Map to the same structure if no lat/lng provided
      pharmacies = pharmacies.map(p => ({
        _id: p.id,
        name: p.name,
        location: { type: 'Point', coordinates: [p.longitude || 0, p.latitude || 0] },
        coords: [p.latitude || 0, p.longitude || 0],
        distance: 'Unknown',
        rating: '4.5',
        isOpen: p.isOpen,
        isEmergency: p.isEmergency,
      }));
    }

    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
