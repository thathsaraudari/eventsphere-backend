const mongoose = require('mongoose');
const Event = require('../models/Event.model');
const RSVP = require('../models/RSVP.model');

async function getEventById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid event id'});
        }

    const event = await Event.findById(id).populate('userId');
    console.log(event.userId); 
    if(!event) return res.status(404).json({ message : 'Event not found' });

    res.json(event);
} catch (err) {
    console.error('getEventById:', err);
    res.status(500).json({ message: 'error'});
}
}
 module.exports = { getEventById };

// calculate the seats Remaining based on RSVPs
async function calculateSeatsRemaining(event) {
    const reservedCount = await RSVP.countDocuments({ eventId: event._id, status: 'reserved' });
    const cap = Math.max(0, event.capacity.number);
    event.capacity.seatsRemaining = Math.max(0, cap - reservedCount);
}

module.exports.calculateSeatsRemaining = calculateSeatsRemaining;
