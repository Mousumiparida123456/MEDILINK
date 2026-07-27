const mongoose = require('mongoose');

const basketItemSchema = new mongoose.Schema({
  genericName: { type: String, required: true },
  quantity: { type: Number, default: 1 }
});

const basketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [basketItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Basket', basketSchema);
