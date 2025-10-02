const router = require('express').Router();
const mongoose = require('mongoose');
const SavedEvent = require('../models/SavedEvent.model');
const Event = require('../models/Event.model');
const { isAuthenticated } = require('../middlewares/jwt.middleware');

router.use(isAuthenticated);

router.post('/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, active: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or inactive' });
    }

    const saved = await SavedEvent.findOneAndUpdate(
      { userId: req.user._id, eventId },
      { $set: { active: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, saved });
  } catch (err) {
    next(err);
  }
});

router.delete('/:eventId', async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const saved = await SavedEvent.findOneAndUpdate(
      { userId: req.user._id, eventId },
      { $set: { active: false } },
      { new: true }
    );

    if (!saved) {
      return res.status(404).json({ message: 'Event not saved' });
    }

    res.json({ success: true, saved });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const saved = await SavedEvent.find({ userId: req.user._id, active: true })
      .populate({ path: 'eventId', match: { active: true } })
      .sort({ createdAt: -1 });

    const results = saved.filter(item => item.eventId);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
