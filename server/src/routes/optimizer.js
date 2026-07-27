const router = require('express').Router();
const Basket = require('../models/Basket');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');

// Helper to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Manage Basket
router.post('/basket', async (req, res) => {
  try {
    const { userId, items } = req.body;
    // In a real app, userId comes from req.user
    
    let basket = await Basket.findOne({ userId });
    if (!basket) {
      basket = new Basket({ userId, items: [] });
    }
    
    // Update items
    basket.items = items;
    await basket.save();
    
    res.json(basket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/basket/:userId', async (req, res) => {
  try {
    const basket = await Basket.findOne({ userId: req.params.userId });
    res.json(basket || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Optimization Engine
router.post('/optimize', async (req, res) => {
  try {
    const { items, lat, lng } = req.body; 
    // items format: [{ genericName: '...', quantity: 1 }]
    
    if (!items || items.length === 0) return res.status(400).json({ message: 'Basket is empty' });

    const genericNames = items.map(i => new RegExp(`^${i.genericName}$`, 'i'));
    
    // Fetch all available medicines matching the basket
    const inventory = await Medicine.find({
      genericName: { $in: genericNames },
      'stockAvailability.inStock': true
    }).populate('pharmacyId', 'name email location');

    if (inventory.length === 0) {
      return res.status(400).json({ message: 'None of the requested medicines are available' });
    }

    // --- Helper to build a plan format ---
    const buildPlanResponse = (type, selectedItems) => {
        let totalPrice = 0;
        let totalDistance = 0;
        let pharmacySet = new Set();
        let lastLat = lat, lastLng = lng;

        const details = selectedItems.map(item => {
            totalPrice += item.medicine.price * item.quantity;
            pharmacySet.add(item.medicine.pharmacyId._id.toString());
            
            // Calculate distance segment if lat/lng available
            let dist = 0;
            if (item.medicine.pharmacyId.location && item.medicine.pharmacyId.location.coordinates) {
                const [pLng, pLat] = item.medicine.pharmacyId.location.coordinates;
                dist = calculateDistance(lastLat, lastLng, pLat, pLng);
            }
            
            return {
                medicineId: item.medicine._id,
                brandName: item.medicine.brandName,
                genericName: item.medicine.genericName,
                price: item.medicine.price,
                quantity: item.quantity,
                pharmacy: item.medicine.pharmacyId,
                distanceSegment: dist
            };
        });

        // Simple sum of distances for the route approximation
        // In a real TSP, we would order the pharmacies optimally. 
        // Here we just sum the distance from user to each unique pharmacy for simplicity,
        // or a rough path estimation. Let's do User -> P1 -> P2 (naive).
        let uniquePharmacies = [];
        let visited = new Set();
        details.forEach(d => {
            if (!visited.has(d.pharmacy._id.toString())) {
                visited.add(d.pharmacy._id.toString());
                uniquePharmacies.push(d.pharmacy);
            }
        });

        let currentLat = lat, currentLng = lng;
        uniquePharmacies.forEach(p => {
             if (p.location && p.location.coordinates) {
                 const [pLng, pLat] = p.location.coordinates;
                 totalDistance += calculateDistance(currentLat, currentLng, pLat, pLng);
                 currentLat = pLat;
                 currentLng = pLng;
             }
        });

        return {
            type,
            totalPrice: totalPrice,
            totalDistance: totalDistance,
            estimatedTimeMins: Math.round(totalDistance * 3) + (uniquePharmacies.length * 5), // 3 mins per km + 5 mins per stop
            pharmacyCount: uniquePharmacies.length,
            details
        };
    };

    // --- Cheapest Plan ---
    // Pure greedy: for each item, pick the absolute cheapest option
    let cheapestItems = [];
    items.forEach(reqItem => {
        const matches = inventory.filter(m => m.genericName.toLowerCase() === reqItem.genericName.toLowerCase() && m.stockAvailability.quantity >= reqItem.quantity);
        if (matches.length > 0) {
            matches.sort((a, b) => a.price - b.price);
            cheapestItems.push({ medicine: matches[0], quantity: reqItem.quantity });
        }
    });
    const cheapestPlan = buildPlanResponse('cheapest', cheapestItems);

    // --- Minimum Stops Plan ---
    // Greedy Set Cover: Find the pharmacy that has the most remaining needed items
    let minStopsItems = [];
    let unfulfilled = [...items];
    let availableInventory = [...inventory];

    while (unfulfilled.length > 0) {
        // Group remaining inventory by pharmacy
        let pharmacyCoverage = {};
        availableInventory.forEach(m => {
            const reqItem = unfulfilled.find(i => i.genericName.toLowerCase() === m.genericName.toLowerCase());
            if (reqItem && m.stockAvailability.quantity >= reqItem.quantity) {
                const pId = m.pharmacyId._id.toString();
                if (!pharmacyCoverage[pId]) pharmacyCoverage[pId] = [];
                pharmacyCoverage[pId].push({ medicine: m, quantity: reqItem.quantity });
            }
        });

        // Find pharmacy covering the most items
        let bestPharmacyId = null;
        let bestCoverage = [];
        for (const pId in pharmacyCoverage) {
            if (pharmacyCoverage[pId].length > bestCoverage.length) {
                bestCoverage = pharmacyCoverage[pId];
                bestPharmacyId = pId;
            }
        }

        if (bestCoverage.length === 0) break; // Cannot fulfill remaining

        // Pick the cheapest medicines from this chosen pharmacy to cover the items
        // Since we already grouped them, we just pick the first match (we could sort by price first)
        bestCoverage.forEach(cov => {
            minStopsItems.push(cov);
            unfulfilled = unfulfilled.filter(u => u.genericName.toLowerCase() !== cov.medicine.genericName.toLowerCase());
        });
    }
    const minStopsPlan = buildPlanResponse('minimum_stops', minStopsItems);


    // --- Fastest Plan ---
    // Greedy but weighted by distance instead of just coverage count
    let fastestItems = [];
    unfulfilled = [...items];
    availableInventory = [...inventory];
    let currentLat = lat || 0, currentLng = lng || 0;

    while (unfulfilled.length > 0) {
        let pharmacyCoverage = {};
        availableInventory.forEach(m => {
            const reqItem = unfulfilled.find(i => i.genericName.toLowerCase() === m.genericName.toLowerCase());
            if (reqItem && m.stockAvailability.quantity >= reqItem.quantity) {
                const pId = m.pharmacyId._id.toString();
                if (!pharmacyCoverage[pId]) {
                    let dist = Number.MAX_VALUE;
                    if (m.pharmacyId.location && m.pharmacyId.location.coordinates) {
                        const [pLng, pLat] = m.pharmacyId.location.coordinates;
                        dist = calculateDistance(currentLat, currentLng, pLat, pLng);
                    }
                    pharmacyCoverage[pId] = { matches: [], distance: dist };
                }
                pharmacyCoverage[pId].matches.push({ medicine: m, quantity: reqItem.quantity });
            }
        });

        // Score = items_covered / (distance + 1) -> maximize score
        let bestPharmacyId = null;
        let bestCoverage = null;
        let bestScore = -1;

        for (const pId in pharmacyCoverage) {
            const cov = pharmacyCoverage[pId];
            const score = cov.matches.length / ((cov.distance || 0) + 1);
            if (score > bestScore) {
                bestScore = score;
                bestCoverage = cov;
                bestPharmacyId = pId;
            }
        }

        if (!bestCoverage || bestCoverage.matches.length === 0) break;

        bestCoverage.matches.forEach(match => {
            fastestItems.push(match);
            unfulfilled = unfulfilled.filter(u => u.genericName.toLowerCase() !== match.medicine.genericName.toLowerCase());
        });

        // update current location to this pharmacy
        if (bestCoverage.matches[0].medicine.pharmacyId.location && bestCoverage.matches[0].medicine.pharmacyId.location.coordinates) {
             currentLng = bestCoverage.matches[0].medicine.pharmacyId.location.coordinates[0];
             currentLat = bestCoverage.matches[0].medicine.pharmacyId.location.coordinates[1];
        }
    }
    const fastestPlan = buildPlanResponse('fastest', fastestItems);

    res.json({
        cheapest: cheapestPlan,
        fastest: fastestPlan,
        minimumStops: minStopsPlan
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reserve Optimized Plan
router.post('/reserve', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    // plan format is exactly what we output in `buildPlanResponse`

    if (!plan || !plan.details) {
        return res.status(400).json({ message: 'Invalid plan provided' });
    }

    const reservations = [];
    // Group by pharmacy
    for (const detail of plan.details) {
        const qrToken = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        
        const reservation = new Reservation({
            userId: userId || '000000000000000000000000', // mocked for demo if unauth
            pharmacyId: detail.pharmacy._id,
            medicineId: detail.medicineId,
            quantity: detail.quantity,
            pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            status: 'pending',
            qrCodeToken: qrToken
        });
        
        await reservation.save();
        reservations.push(reservation);
    }

    res.json({ message: 'Plan reserved successfully', reservations });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
