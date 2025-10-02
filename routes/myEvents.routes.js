const router = require("express").Router();
const mongoose = require('mongoose');
const Event = require("../models/Event.model");
const RSVP = require("../models/RSVP.model");
const { calculateSeatsRemaining } = require('../controllers/events.controller');
const { isAuthenticated } = require('../middlewares/jwt.middleware');

router.get("/attending", isAuthenticated, async (req, res, next) => {
  
  try {
    const user = req.user; 
    const rsvps = await RSVP.find({ userId: user._id, status: 'reserved' }).populate('eventId');
    res.json(rsvps);
  } catch (err) {
    next(err);
  }

});

router.get("/attending/:eventId", isAuthenticated, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const record = await RSVP.findOne({ eventId, userId }).select('status');

    if (!record) return res.json({ status: 'not_available' });

    return res.json({ status: record.status });
  } catch (err) {
    next(err);
  }
});

router.get("/hosting", isAuthenticated, async (req, res, next) => {
  try {
    const user = req.user;
    const events = await Event.find({ userId: user._id, active: true });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.post('/attending/:eventId/rsvp/toggle', isAuthenticated, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    let rsvp = await RSVP.findOne({ eventId, userId });

    await calculateSeatsRemaining(event);

    const seatsRemaining = event.capacity.seatsRemaining

    if (!rsvp) {
      if (seatsRemaining <= 0) {
        return res.status(409).json({ message: 'No seats remaining', success: false });
      }
      rsvp = await RSVP.create({ eventId, userId, status: 'reserved' });
    } else {
      if (rsvp.status === 'reserved') {
        rsvp.status = 'cancelled';
        await rsvp.save();
      } else {
        await calculateSeatsRemaining(event);
        const seatsRemaining = event.capacity.seatsRemaining;
        if (seatsRemaining <= 0) {
          return res.status(409).json({ message: 'No seats remaining', success: false });
        }
        rsvp.status = 'reserved';
        await rsvp.save();
      }
    }

    await calculateSeatsRemaining(event);
    await event.save();

    return res.json({
      status: rsvp.status,
      success: true,
      seatsRemaining: event.capacity.seatsRemaining
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
