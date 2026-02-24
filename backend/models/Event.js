const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true },
    venue: { type: String, required: true },
    address: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

}, { timestamps: true });

eventSchema.index({ location: '2dsphere' });

// Prevent duplicate events
eventSchema.index({ artist: 1, venue: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Event', eventSchema);
