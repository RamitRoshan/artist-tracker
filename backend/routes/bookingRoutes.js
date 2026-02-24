const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect, artistOnly } = require('../middleware/authMiddleware');

//  POST /api/bookings
// Book tickets to an event
// @access  Private (Fan or Artist)
router.post('/', protect, async (req, res) => {
    const { eventId, tickets, attendeeName, attendeeEmail, attendeePhone, attendeeAge } = req.body;
    if (!eventId || !tickets || tickets < 1 || !attendeeName || !attendeeEmail || !attendeePhone || !attendeeAge) {
        return res.status(400).json({ message: 'Please provide all booking details including attendee information' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const booking = await Booking.create({
            fan: req.user._id,
            event: eventId,
            tickets,
            attendeeName,
            attendeeEmail,
            attendeePhone,
            attendeeAge
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   GET /api/bookings/mybookings
// @desc    Get user's bookings
// @access  Private
router.get('/mybookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ fan: req.user._id }).populate('event');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
