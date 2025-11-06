const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // who made the request
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },     // who receives the request
  mySlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirSlotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
