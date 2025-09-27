const router = require("express").Router();
const mongoose = require('mongoose');
const Event = require("../models/Event.model");
const RSVP = require("../models/RSVP.model");
const { getEventById, calculateSeatsRemaining } = require('../controllers/events.controller');
const { isAuthenticated } = require('../middlewares/jwt.middleware');

router.get("/", async (req, res, next) => {
  
  try {
    const {searchTerm = "", postCode = ""} = req.query;
    
    const filterQuery = {};

    if (searchTerm.trim()) {
      filterQuery.title = { $regex: searchTerm.trim(), $options: 'i' };
    }

    if (postCode.trim()) {
      filterQuery["location.postCode"] = { $regex: postCode.trim(), $options: 'i'};
    }

    const events = await Event.find(filterQuery);
    res.json(events);
  } catch (err) {
    next(err);
  }

});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payload = req.body || {};

    const eventData = { ...payload, userId };

    if (
      eventData.capacity &&
      typeof eventData.capacity.seatsRemaining === 'undefined' &&
      typeof eventData.capacity.number === 'number'
    ) {
      eventData.capacity.seatsRemaining = eventData.capacity.number;
    }

    const created = await Event.create(eventData);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updates = { ...(req.body || {}) };
  
    for (const key of Object.keys(updates)) {
      event[key] = updates[key];
    }

    await calculateSeatsRemaining(event);

    const saved = await event.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', getEventById);

router.get('/:id/participants', async (req, res, next) => {
  try {
    const { id } = req.params;

    const rsvps = await RSVP
      .find({ eventId: id })
      .populate('userId', 'name email')
      .select('userId status');

    const participants = rsvps.map(r => ({
      name: r.userId?.name,
      email: r.userId?.email,
      status: r.status,
    }));

    res.json(participants);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
