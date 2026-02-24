import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Calendar, MapPin, Clock } from 'lucide-react';

const ArtistDashboard = () => {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ title: '', venue: '', address: '', date: '', time: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/artist`);
            setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${editingId}`, formData);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, formData);
            }
            setFormData({ title: '', venue: '', address: '', date: '', time: '' });
            setEditingId(null);
            setError('');
            fetchEvents();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save event');
        }
    };

    const handleEdit = (event) => {
        setFormData({
            title: event.title,
            venue: event.venue,
            address: event.address,
            date: new Date(event.date).toISOString().split('T')[0],
            time: event.time,
        });
        setEditingId(event._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
                fetchEvents();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-slate-200">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Artist Hub</h1>
                    <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/20 font-medium text-sm">
                        {events.length} Events Scheduled
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 p-6 rounded-3xl shadow-xl border border-slate-700/50 backdrop-blur-sm sticky top-24">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                {editingId ? <Edit2 className="w-5 h-5 mr-2 text-indigo-400" /> : <Plus className="w-5 h-5 mr-2 text-indigo-400" />}
                                {editingId ? 'Edit Performance' : 'New Performance'}
                            </h2>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 font-medium">Event Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Summer Night Jam"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 font-medium">Venue Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        placeholder="e.g. The Grand Theater"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 font-medium">Full Address (for mapping)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="e.g. 123 Music Ave, NY"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 font-medium">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-300 transition-colors"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 font-medium">Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-300 transition-colors"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-600/20"
                                    >
                                        {editingId ? 'Update Event' : 'Publish Event'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({ title: '', venue: '', address: '', date: '', time: '' });
                                            }}
                                            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Scheduled Events</h2>
                        {events.length === 0 ? (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                <p className="text-xl text-slate-400 font-medium">No events scheduled yet.</p>
                                <p className="text-slate-500 mt-2">Create your first event using the form to get started!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {events.map((event) => (
                                    <div key={event._id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all group shadow-lg shadow-black/10 hover:shadow-indigo-500/10 hover:-translate-y-1">
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors truncate">{event.title}</h3>

                                        <div className="space-y-2.5 text-sm text-slate-400 mb-5">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 mr-2.5 mt-0.5 shrink-0 text-slate-500" />
                                                <div>
                                                    <p className="font-semibold text-slate-300">{event.venue}</p>
                                                    <p className="text-xs mt-0.5">{event.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2.5 text-slate-500" />
                                                <span className="text-slate-300">{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2.5 text-slate-500" />
                                                <span className="text-slate-300">{event.time}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex items-center text-sm font-medium"
                                            >
                                                <Edit2 className="w-4 h-4 mr-1.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistDashboard;
