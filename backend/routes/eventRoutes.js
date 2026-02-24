const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, artistOnly } = require('../middleware/authMiddleware');
const axios = require('axios');

// Default location (e.g. New York)
const DEFAULT_COORDS = [-74.0060, 40.7128];

// Mapbox or Nominatim for geocoding. Using Nominatim (OpenStreetMap) so no API key needed.
const geocodeAddress = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'ArtistTrackerApp' }
        });
        if (response.data && response.data.length > 0) {
            return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
        }
    } catch (error) {
        console.error('Geocoding error:', error.message);
    }
    return DEFAULT_COORDS; // fallback
};

// @route   GET /api/events
// @desc    Get all events (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('artist', 'name email profilePicture');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/events/artist
// @desc    Get logged in artist's events
// @access  Private/Artist
router.get('/artist', protect, artistOnly, async (req, res) => {
    try {
        const events = await Event.find({ artist: req.user._id });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/events
// @desc    Create an event
// @access  Private/Artist
//Create Event
router.post('/', protect, artistOnly, async (req, res) => {
    const { title, venue, address, date, time } = req.body;

    if (!title || !venue || !address || !date || !time) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if duplicate event exists for this artist
        const existing = await Event.findOne({ artist: req.user._id, venue, date, time });
        if (existing) {
            return res.status(400).json({ message: 'An identical event already exists.' });
        }

        const coordinates = await geocodeAddress(address);

        const event = await Event.create({
            artist: req.user._id,
            title,
            venue,
            address,
            date,
            time,
            location: { type: 'Point', coordinates }
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Artist
router.put('/:id', protect, artistOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.artist.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const { title, venue, address, date, time } = req.body;
        let coordinates = event.location.coordinates;
        if (address && address !== event.address) {
            coordinates = await geocodeAddress(address);
        }

        event.title = title || event.title;
        event.venue = venue || event.venue;
        event.address = address || event.address;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location.coordinates = coordinates;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An identical event already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Artist
router.delete('/:id', protect, artistOnly, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.artist.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
