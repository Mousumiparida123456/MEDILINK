const router = require('express').Router();
const prisma = require('../utils/prisma');

// Search Medicines
// Query params: q (search term), lat, lng, maxDistance (in km), maxPrice, inStock (boolean)
router.get('/search', async (req, res) => {
  try {
    const { q, lat, lng, maxDistance = 10, maxPrice, inStock, limit = 20 } = req.query;

    let where = {};

    // Text search if query provided
    if (q) {
      where.OR = [
        { brandName: { contains: q, mode: 'insensitive' } },
        { genericName: { contains: q, mode: 'insensitive' } }
        // For array fields like diseaseTags, doing partial matches natively in Prisma Postgres is tricky,
        // so we stick to brandName and genericName for search
      ];
    }

    // Filters
    if (maxPrice) {
      where.price = { lte: Number(maxPrice) };
    }
    if (inStock === 'true') {
      where.inStock = true;
    }

    let medicines = await prisma.medicine.findMany({
      where,
      include: {
        pharmacy: {
          select: { name: true, email: true, latitude: true, longitude: true }
        }
      }
    });

    // Calculate distance and filter if lat/lng provided
    if (lat && lng) {
      medicines = medicines.map(m => {
        let distance = null;
        if (m.latitude != null && m.longitude != null) {
          const mLat = m.latitude;
          const mLng = m.longitude;
          // simple haversine in js
          const R = 6371; 
          const dLat = (mLat - Number(lat)) * (Math.PI/180);
          const dLon = (mLng - Number(lng)) * (Math.PI/180);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Number(lat) * (Math.PI/180)) * Math.cos(mLat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
        }
        return { ...m, distance };
      });

      // Filter by maxDistance
      medicines = medicines.filter(m => m.distance !== null && m.distance <= Number(maxDistance));
      
      // Sort by distance
      medicines.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Apply limit after filtering
    medicines = medicines.slice(0, Number(limit));

    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-suggest (simple match for typeahead)
router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const suggestions = await prisma.medicine.findMany({
      where: {
        OR: [
          { brandName: { contains: q, mode: 'insensitive' } },
          { genericName: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5,
      select: { brandName: true, genericName: true }
    });

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
    const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    const alternatives = await prisma.medicine.findMany({
      where: {
        genericName: medicine.genericName,
        id: { not: medicine.id }
      },
      take: 5,
      include: {
        pharmacy: { select: { name: true } }
      }
    });
    
    res.json(alternatives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id },
      include: {
        pharmacy: { select: { name: true, email: true, latitude: true, longitude: true } }
      }
    });
    
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
