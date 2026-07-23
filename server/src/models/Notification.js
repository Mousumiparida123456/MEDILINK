const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['reservation_status', 'stock_alert', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String } // Optional deep link
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
