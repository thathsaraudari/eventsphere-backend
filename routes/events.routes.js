const router = require("express").Router();
const Event = require("../models/Event.model");
const { getEventById } = require('../controllers/events.controller');
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

// Create a new event (protected)
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

router.get('/:id', getEventById);

module.exports = router;
