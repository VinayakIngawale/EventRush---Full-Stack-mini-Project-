// server/routes/events.js

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// server/routes/events.js
// ... (keep existing code)
const authMiddleware = require('../middleware/authMiddleware'); 

// ... (keep the GET routes)

// NEW ROUTE: Participate in an event (Protected)
router.post('/:id/participate', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        if (event.participants.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User already registered for this event' });
        }

        event.participants.push(req.user.id);
        await event.save();

        res.json({ msg: 'Successfully registered for the event', participants: event.participants });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;