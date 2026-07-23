const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  genericName: { type: String, required: true },
  diseaseTags: [{ type: String }],
  price: { type: Number, required: true },
  manufacturer: { type: String, default: 'Unknown' },
  dosage: { type: String, default: 'As prescribed' },
  uses: [{ type: String }],
  sideEffects: [{ type: String }],
  alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  imageUrl: { type: String, default: '' },
  stockAvailability: {
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 0 }
  },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pharmacyName: { type: String }, // denormalized for easy querying
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

medicineSchema.index({ location: '2dsphere' });
// Text index for intelligent search
medicineSchema.index({ brandName: 'text', genericName: 'text', diseaseTags: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
