const router = require('express').Router();
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const { auth } = require('../middleware/auth');

// Get reviews for a medicine
router.get('/:medicineId', async (req, res) => {
  try {
    const reviews = await Review.find({ medicineId: req.params.medicineId })
      .populate('userId', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a review
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, rating, comment } = req.body;
    
    // Check if user has a completed reservation for this medicine
    const pastReservation = await Reservation.findOne({
      userId: req.user.id,
      medicineId,
      status: 'completed'
    });

    const review = new Review({
      userId: req.user.id,
      medicineId,
      rating,
      comment,
      isVerifiedPurchase: !!pastReservation
    });

    await review.save();
    
    // In a real app, we would update the Medicine's average rating here.
    
    await review.populate('userId', 'name');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const index = review.likes.indexOf(req.user.id);
    if (index === -1) {
      review.likes.push(req.user.id);
    } else {
      review.likes.splice(index, 1);
    }
    
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
