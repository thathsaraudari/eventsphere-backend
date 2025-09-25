const mongoose = require('mongoose');
const Event = require('../models/Event.model');

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
    console.error('getEventById:', error);
    res.status(500).json({ message: 'error'});
}
}
 module.export = { getEventById};
