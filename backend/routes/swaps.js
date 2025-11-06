const express = require('express');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

/**
 * GET /api/swappable-slots
 * List all other users' swappable slots
 */
router.get('/swappable-slots', async (req, res) => {
  try {
    const slots = await Event.find({
      userId: { $ne: req.user._id },
      status: 'SWAPPABLE'
    }).populate('userId', 'name email');

    res.json(slots);
  } catch (err) {
    console.error('Fetch swappable slots error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/swap-request
 * Create new swap request
 * body: { mySlotId, theirSlotId }
 */
router.post('/swap-request', async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    if (!mySlotId || !theirSlotId)
      return res.status(400).json({ message: 'Missing slot IDs' });

    const mySlot = await Event.findOne({ _id: mySlotId, userId: req.user._id });
    const theirSlot = await Event.findById(theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: 'One or both events not found' });

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE')
      return res.status(400).json({ message: 'Both slots must be SWAPPABLE' });

    // Create swap request
    const swapReq = new SwapRequest({
      requesterId: req.user._id,
      targetId: theirSlot.userId,
      mySlotId,
      theirSlotId
    });
    await swapReq.save();

    // Set both to SWAP_PENDING
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';
    await mySlot.save();
    await theirSlot.save();

    res.status(201).json(swapReq);
  } catch (err) {
    console.error('Swap request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/swap-response/:id
 * Accept or reject swap request
 * body: { accept: true/false }
 */
router.post('/swap-response/:id', async (req, res) => {
  const { id } = req.params;
  const { accept } = req.body;

  try {
    const swapReq = await SwapRequest.findById(id);
    if (!swapReq) return res.status(404).json({ message: 'Request not found' });
    if (!swapReq.targetId.equals(req.user._id))
      return res.status(403).json({ message: 'Not your request to respond to' });

    const mySlot = await Event.findById(swapReq.mySlotId);
    const theirSlot = await Event.findById(swapReq.theirSlotId);

    if (!mySlot || !theirSlot)
      return res.status(404).json({ message: 'Events not found' });

    if (accept) {
      // Accept swap
      swapReq.status = 'ACCEPTED';

      // Swap ownerships
      const tempOwner = mySlot.userId;
      mySlot.userId = theirSlot.userId;
      theirSlot.userId = tempOwner;

      mySlot.status = 'BUSY';
      theirSlot.status = 'BUSY';
    } else {
      // Reject swap
      swapReq.status = 'REJECTED';
      mySlot.status = 'SWAPPABLE';
      theirSlot.status = 'SWAPPABLE';
    }

    await Promise.all([swapReq.save(), mySlot.save(), theirSlot.save()]);
    res.json({ message: `Swap ${accept ? 'accepted' : 'rejected'}`, swapReq });
  } catch (err) {
    console.error('Swap response error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/swap-requests
 * See incoming & outgoing swap requests
 */
router.get('/swap-requests', async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ targetId: req.user._id })
      .populate('mySlotId theirSlotId requesterId', 'title status name email');
    const outgoing = await SwapRequest.find({ requesterId: req.user._id })
      .populate('mySlotId theirSlotId targetId', 'title status name email');

    res.json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
