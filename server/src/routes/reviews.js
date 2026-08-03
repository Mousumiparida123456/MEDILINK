const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

// Get reviews for a medicine
router.get('/:medicineId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { medicineId: req.params.medicineId },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to match frontend expectation (userId is populated object)
    const formattedReviews = reviews.map(r => ({
      ...r,
      _id: r.id,
      userId: r.user
    }));
    
    res.json(formattedReviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a review
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, rating, comment } = req.body;
    
    // Check if user has a completed reservation for this medicine
    const pastReservation = await prisma.reservation.findFirst({
      where: {
        userId: req.user.id,
        medicineId,
        status: 'completed'
      }
    });

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        medicineId,
        rating: Number(rating),
        comment,
        isVerifiedPurchase: !!pastReservation
      },
      include: {
        user: { select: { name: true } }
      }
    });

    // In a real app, we would update the Medicine's average rating here.
    
    const formattedReview = { ...review, _id: review.id, userId: review.user };
    res.status(201).json(formattedReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { likes: { select: { id: true } } }
    });
    
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const hasLiked = review.likes.some(u => u.id === req.user.id);
    
    let updatedReview;
    if (!hasLiked) {
      updatedReview = await prisma.review.update({
        where: { id: review.id },
        data: {
          likes: { connect: { id: req.user.id } }
        },
        include: { likes: { select: { id: true } } }
      });
    } else {
      updatedReview = await prisma.review.update({
        where: { id: review.id },
        data: {
          likes: { disconnect: { id: req.user.id } }
        },
        include: { likes: { select: { id: true } } }
      });
    }
    
    // Format back to array of IDs to match older mongoose schema
    const formatted = {
      ...updatedReview,
      _id: updatedReview.id,
      likes: updatedReview.likes.map(u => u.id)
    };
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
