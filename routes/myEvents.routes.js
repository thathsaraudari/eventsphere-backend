const router = require("express").Router();
const Event = require("../models/Event.model");
const RSVP = require("../models/RSVP.model");
const { getEventById } = require('../controllers/events.controller');
const { isAuthenticated } = require('../middlewares/jwt.middleware');

router.get("/attending", isAuthenticated, async (req, res, next) => {
  
  try {
    const user = req.user; 
    const rsvps = await RSVP.find({ userId: user._id }).populate('eventId');
    res.json(rsvps);
  } catch (err) {
    next(err);
  }

});

module.exports = router;
