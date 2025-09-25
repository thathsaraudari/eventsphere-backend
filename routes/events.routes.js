const router = require("express").Router();
const Event = require("../models/Event.model");
const { getEventById } = require('../controllers/events.controller');

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

router.get('/:id', getEventById);

module.exports = router;
