const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// All routes below require authentication
router.use(auth);

/**
 * POST /api/events
 * Create a new event
 */
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const event = new Event({
      title,
      startTime,
      endTime,
      userId: req.user._id
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/events
 * Get all events of the logged-in user
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/events/:id
 * Update event (title, time, or status)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, userId: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { title, startTime, endTime, status } = req.body;

    if (title) event.title = title;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (status) event.status = status;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete user's event
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Event.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
