const router = require("express").Router();
const mongoose = require('mongoose');
const Event = require("../models/Event.model");
const RSVP = require("../models/RSVP.model");
const { getEventById, calculateSeatsRemaining } = require('../controllers/events.controller');
const { isAuthenticated } = require('../middlewares/jwt.middleware');


router.get("/", async (req, res, next) => {
  try {
    const {
      q = "",
      postalCode = "",
      category = "",
      page = "1",
      limit = "9",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 9, 1);
    const skip = (pageNum - 1) * limitNum;

    const filterQuery = { active: true };

    const search = (q || "").toString().trim();
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const postalCodeQuery = (postalCode || "").toString().trim();
    if (postalCodeQuery) {
      filterQuery["location.postCode"] = { $regex: postalCode, $options: 'i' };
    }

    const categoryQuery = category.toString().trim();
    if (categoryQuery) {
      filterQuery.category = { $regex: `^${categoryQuery}$`, $options: 'i' };
    }

    const [total, events] = await Promise.all([
      Event.countDocuments(filterQuery),
      Event.find(filterQuery)
        .sort({ startAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    res.json({
      data: events,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    if (event.active === false) {
      return res.json({ success: true, message: 'Event already inactive', event });
    }

    event.active = false;
    const saved = await event.save();
    return res.json({ success: true, event: saved });
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
      .populate('userId', 'firstName lastName email prefix jobTitle')
      .select('userId status');

    const participants = rsvps.map(r => {
      const user = r.userId || {};
      const fullName = [user.firstName || user.name, user.lastName].filter(Boolean).join(' ');
      return {
        firstName: user.firstName || user.name,
        lastName: user.lastName || '',
        fullName: fullName || undefined,
        email: user.email,
        status: r.status,
      };
    });

    res.json(participants);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
