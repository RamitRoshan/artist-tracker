import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Ticket, Clock, CheckCircle, ArrowLeft, Music, User, Mail, Phone, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { AuthContext } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import 'mapbox-gl/dist/mapbox-gl.css';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Reusable Detail Card for both Browse and My Tickets
const EventDetailCard = ({ event, onBack, actionButton, titlePrefix = '', extraDetails, id }) => {
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [amenitiesGraph, setAmenitiesGraph] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        if (event && event.location && event.location.coordinates) {
            // Generating deterministic nearby mock data based on coordinates
            const [lng, lat] = event.location.coordinates;

            // Generate some famous places/temples around the event
            const places = [
                { id: 1, name: 'Grand Temple', type: 'Temple', offsetLat: 0.005, offsetLng: 0.002, color: '#f59e0b' },
                { id: 2, name: 'City Museum', type: 'Museum', offsetLat: -0.003, offsetLng: 0.004, color: '#10b981' },
                { id: 3, name: 'Central Park', type: 'Park', offsetLat: 0.004, offsetLng: -0.005, color: '#22c55e' },
                { id: 4, name: 'Local Shrine', type: 'Temple', offsetLat: -0.006, offsetLng: -0.002, color: '#f59e0b' },
            ].map(p => ({
                ...p,
                lat: lat + p.offsetLat,
                lng: lng + p.offsetLng
            }));

            setNearbyPlaces(places);

            setAmenitiesGraph([
                { name: 'Temples', count: 2, color: '#f59e0b' },
                { name: 'Hotels', count: 12, color: '#3b82f6' },
                { name: 'Transport', count: 5, color: '#8b5cf6' },
                { name: 'Eateries', count: 18, color: '#ef4444' }
            ]);
        }
    }, [event]);

    if (!event) return null;
    return (
        <div id={id} className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 bg-slate-800/80 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start sm:items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-slate-900/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700/50 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        {titlePrefix && <p className="text-indigo-400 font-medium text-sm mb-1">{titlePrefix}</p>}
                        <h2 className="text-3xl font-bold text-white leading-tight">{event.title}</h2>
                        <div className="flex items-center mt-1.5 space-x-2">
                            {event.artist?.profilePicture ? (
                                <img src={event.artist.profilePicture} alt="Artist" className="w-5 h-5 rounded-full object-cover border border-slate-700" />
                            ) : (
                                <Music className="w-4 h-4 text-indigo-400" />
                            )}
                            <p className="text-slate-400 font-medium text-sm">
                                {event.artist?.name || 'Unknown Artist'}
                            </p>
                        </div>
                    </div>
                </div>
                {actionButton && (
                    <div className="w-full md:w-auto shrink-0">
                        {actionButton}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[400px]">
                <div className="p-6 md:p-8 space-y-6 flex flex-col">
                    <h3 className="text-xl font-bold text-white">Event Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-start p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                            <MapPin className="w-6 h-6 mr-4 text-indigo-400 mt-1 shrink-0" />
                            <div>
                                <p className="font-semibold text-white text-lg">{event.venue}</p>
                                <p className="text-slate-400 mt-1">{event.address}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                <Calendar className="w-6 h-6 mr-4 text-indigo-400 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Date</p>
                                    <p className="font-semibold text-white">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex-1 flex items-center p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                                <Clock className="w-6 h-6 mr-4 text-indigo-400 shrink-0" />
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Time</p>
                                    <p className="font-semibold text-white">{event.time}</p>
                                </div>
                            </div>
                        </div>
                        {extraDetails}
                    </div>

                    {amenitiesGraph.length > 0 && (
                        <div className="mt-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                            <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Nearby Amenities Graph</h4>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={amenitiesGraph} margin={{ top: 0, left: -25, right: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b' }}
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {amenitiesGraph.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                <div className="min-h-[300px] md:min-h-full border-t md:border-t-0 md:border-l border-slate-700/50 relative">
                    {event.location && event.location.coordinates ? (
                        <Map
                            initialViewState={{
                                longitude: event.location.coordinates[0],
                                latitude: event.location.coordinates[1],
                                zoom: 14
                            }}
                            mapStyle="mapbox://styles/mapbox/dark-v11"
                            mapboxAccessToken={MAPBOX_TOKEN}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <NavigationControl position="bottom-right" />
                            {/* Main Event Marker */}
                            <Marker
                                longitude={event.location.coordinates[0]}
                                latitude={event.location.coordinates[1]}
                                color="#ef4444"
                                style={{ zIndex: 10 }}
                            />

                            {/* Nearby Places Markers */}
                            {nearbyPlaces.map((place) => (
                                <Marker
                                    key={place.id}
                                    longitude={place.lng}
                                    latitude={place.lat}
                                    onClick={(e) => {
                                        e.originalEvent.stopPropagation();
                                        setSelectedPlace(place);
                                    }}
                                >
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-md cursor-pointer hover:scale-125 transition-transform"
                                        style={{ backgroundColor: place.color }}
                                        title={`${place.name} (${place.type})`}
                                    />
                                </Marker>
                            ))}

                            {selectedPlace && (
                                <Popup
                                    longitude={selectedPlace.lng}
                                    latitude={selectedPlace.lat}
                                    anchor="bottom"
                                    onClose={() => setSelectedPlace(null)}
                                    closeButton={false}
                                    className="custom-popup"
                                >
                                    <div className="px-3 py-2 text-center">
                                        <p className="font-bold text-slate-800 text-sm">{selectedPlace.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{selectedPlace.type}</p>
                                    </div>
                                </Popup>
                            )}
                        </Map>
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                            <MapPin className="w-10 h-10 mb-2 opacity-50" />
                            <p>Map unavailable</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FanDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');
    const [bookingSuccess, setBookingSuccess] = useState('');

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    // Booking Form State
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        attendeeName: '',
        attendeeEmail: '',
        attendeePhone: '',
        attendeeAge: ''
    });

    useEffect(() => {
        if (selectedEvent && user && !showBookingForm) {
            setBookingForm({
                attendeeName: user.name || '',
                attendeeEmail: user.email || '',
                attendeePhone: user.phone || '',
                attendeeAge: ''
            });
        }
    }, [selectedEvent, user, showBookingForm]);

    useEffect(() => {
        fetchEvents();
        fetchBookings();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
            setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/mybookings`);
            setBookings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBook = async (e) => {
        if (e) e.preventDefault();

        setIsBooking(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, {
                eventId: selectedEvent._id,
                tickets: 1,
                ...bookingForm
            });
            setBookingSuccess('Ticket booked successfully! Redirecting...');
            fetchBookings();

            setTimeout(() => {
                setBookingSuccess('');
                setActiveTab('bookings');
                setSelectedEvent(null);
                setIsBooking(false);
                setShowBookingForm(false);
            }, 2000);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
            setIsBooking(false);
        }
    };

    const downloadPDF = async () => {
        const ticketElement = document.getElementById('ticket-download-card');
        if (!ticketElement) return;

        try {
            const canvas = await html2canvas(ticketElement, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ticket-${selectedTicket._id}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Could not download PDF. Please try again.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Fan Portal</h1>
                        <p className="mt-2 text-slate-400 text-lg">Discover events and manage your bookings.</p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md self-start md:self-auto">
                        <button
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center ${activeTab === 'browse' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            onClick={() => {
                                setActiveTab('browse');
                                setSelectedEvent(null);
                                setSelectedTicket(null);
                                setShowBookingForm(false);
                            }}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Browse Events
                        </button>
                        <button
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center ${activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                            onClick={() => {
                                setActiveTab('bookings');
                                setSelectedEvent(null);
                                setSelectedTicket(null);
                                setShowBookingForm(false);
                            }}
                        >
                            <Ticket className="w-4 h-4 mr-2" />
                            My Tickets
                            <span className="ml-2 bg-slate-900/50 text-indigo-300 py-0.5 px-2 rounded-full text-xs border border-indigo-500/20">{bookings.length}</span>
                        </button>
                    </div>
                </div>

                {bookingSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-6 py-4 rounded-xl flex items-center justify-between font-medium sticky top-20 z-50 backdrop-blur-md shadow-lg animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            {bookingSuccess}
                        </div>
                        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                    </div>
                )}

                {activeTab === 'browse' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {selectedEvent ? (
                            <EventDetailCard
                                event={selectedEvent}
                                onBack={() => {
                                    if (showBookingForm) {
                                        setShowBookingForm(false);
                                    } else {
                                        setSelectedEvent(null);
                                    }
                                }}
                                titlePrefix={showBookingForm ? "COMPLETE BOOKING DETAILS" : "UPCOMING EVENT"}
                                extraDetails={
                                    showBookingForm ? (
                                        <form onSubmit={handleBook} className="mt-4 space-y-4 p-5 bg-slate-900/50 rounded-2xl border border-indigo-500/30">
                                            <h4 className="text-white font-semibold mb-2 flex items-center"><User className="w-4 h-4 mr-2 text-indigo-400" />Attendee Information</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                                                    <input required type="text" value={bookingForm.attendeeName} onChange={e => setBookingForm({ ...bookingForm, attendeeName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="John Doe" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Email <span className="text-slate-500">(Optional if Fan)</span></label>
                                                    <input required type="email" value={bookingForm.attendeeEmail} onChange={e => setBookingForm({ ...bookingForm, attendeeEmail: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="john@example.com" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                                                    <input required type="tel" value={bookingForm.attendeePhone} onChange={e => setBookingForm({ ...bookingForm, attendeePhone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="+91 9876543210" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Age</label>
                                                    <input required type="number" min="1" max="100" value={bookingForm.attendeeAge} onChange={e => setBookingForm({ ...bookingForm, attendeeAge: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="25" />
                                                </div>
                                            </div>
                                        </form>
                                    ) : null
                                }
                                actionButton={
                                    showBookingForm ? (
                                        <button
                                            onClick={handleBook}
                                            disabled={isBooking}
                                            className={`w-full md:w-auto ${isBooking ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20'} text-white py-3 px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            {isBooking ? 'Confirming...' : 'Confirm Booking'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowBookingForm(true)}
                                            className={`w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 text-white py-3 px-8 rounded-xl font-bold transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
                                        >
                                            <Ticket className="w-5 h-5 mr-2" />
                                            Book Ticket
                                        </button>
                                    )
                                }
                            />
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-6">Upcoming Performances</h2>
                                {events.length === 0 ? (
                                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center max-w-2xl mx-auto">
                                        <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                        <p className="text-xl text-slate-400 font-medium">No events currently listed.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {events.map((event) => (
                                            <div
                                                key={event._id}
                                                className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 flex flex-col group shadow-lg shadow-black/10 hover:shadow-indigo-500/20 hover:-translate-y-1 cursor-pointer"
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                                <div className="p-6 flex-grow flex flex-col">
                                                    <div className="mb-4">
                                                        <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-1" title={event.title}>{event.title}</h3>
                                                        <div className="flex items-center space-x-2">
                                                            {event.artist?.profilePicture ? (
                                                                <img src={event.artist.profilePicture} alt="Artist" className="w-5 h-5 rounded-full object-cover border border-slate-700" />
                                                            ) : (
                                                                <Music className="w-3.5 h-3.5 text-indigo-400" />
                                                            )}
                                                            <p className="text-indigo-400 font-medium text-sm">
                                                                {event.artist?.name || 'Unknown Artist'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 text-sm text-slate-300 mb-6 flex-grow">
                                                        <div className="flex items-start">
                                                            <MapPin className="w-4 h-4 mr-3 text-slate-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="font-semibold text-slate-200">{event.venue}</p>
                                                                <p className="text-slate-500 mt-0.5 truncate" title={event.address}>{event.address}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-slate-300 bg-slate-900/50 w-max px-3 py-1.5 rounded-lg border border-slate-700/50 mt-1">
                                                            <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                                            <span className="mx-2 text-slate-600">•</span>
                                                            <span>{event.time}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                            setShowBookingForm(true);
                                                        }}
                                                        disabled={isBooking}
                                                        className="w-full mt-auto bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-transparent py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center focus:outline-none"
                                                    >
                                                        <Ticket className="w-4 h-4 mr-2" />
                                                        Book 1 Ticket
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="text-center mt-10 pb-6">
                                    <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium p-2 hover:bg-indigo-500/10 rounded-lg transition-colors">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        View on interactive map
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {selectedTicket ? (
                            <div className="space-y-4">
                                <div className="flex justify-end lg:max-w-6xl mx-auto">
                                    <button
                                        onClick={downloadPDF}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-500/20"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF Ticket
                                    </button>
                                </div>
                                <EventDetailCard
                                    id="ticket-download-card"
                                    event={selectedTicket.event}
                                    onBack={() => setSelectedTicket(null)}
                                    titlePrefix="YOUR TICKET"
                                    extraDetails={
                                        <div className="space-y-4">
                                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs text-indigo-300/70 font-medium uppercase tracking-wider mb-1">Booking ID</p>
                                                    <p className="text-indigo-300 font-mono text-sm">{selectedTicket._id}</p>
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="text-xs text-indigo-300/70 font-medium uppercase tracking-wider mb-1">Quantity</p>
                                                    <p className="text-indigo-300 font-bold text-xl">{selectedTicket.tickets} <span className="text-sm font-medium">Ticket(s)</span></p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700/50">
                                                <h4 className="text-white font-semibold mb-3 flex items-center text-sm uppercase tracking-wider"><User className="w-4 h-4 mr-2 text-indigo-400" /> Attendee Details</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Name</p>
                                                        <p className="text-slate-300 font-medium">{selectedTicket.attendeeName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Age</p>
                                                        <p className="text-slate-300 font-medium">{selectedTicket.attendeeAge}</p>
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <p className="text-xs text-slate-500 font-medium flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</p>
                                                        <p className="text-slate-300 text-sm truncate">{selectedTicket.attendeeEmail}</p>
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <p className="text-xs text-slate-500 font-medium flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone</p>
                                                        <p className="text-slate-300 text-sm">{selectedTicket.attendeePhone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-6">Your Tickets</h2>
                                {bookings.length === 0 ? (
                                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-12 text-center max-w-2xl mx-auto">
                                        <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                                        <p className="text-xl text-slate-400 font-medium">You haven't booked any tickets yet.</p>
                                        <button
                                            onClick={() => setActiveTab('browse')}
                                            className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                                        >
                                            Browse Events
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-slate-300">
                                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700/50">
                                                    <tr>
                                                        <th className="px-6 py-4 font-semibold tracking-wider">Event Details</th>
                                                        <th className="px-6 py-4 font-semibold tracking-wider">Date & Time</th>
                                                        <th className="px-6 py-4 font-semibold tracking-wider">Venue</th>
                                                        <th className="px-6 py-4 font-semibold tracking-wider text-right">Tickets</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700/50">
                                                    {bookings.map((booking) => (
                                                        <tr
                                                            key={booking._id}
                                                            className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                                                            onClick={() => booking.event && setSelectedTicket(booking)}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                                                                    {booking.event ? booking.event.title : 'Event Unavailable'}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">ID: <span className="font-mono text-slate-400">{booking._id.substring(18)}</span></div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {booking.event ? (
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center text-sm font-medium text-slate-300">
                                                                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                                            {new Date(booking.event.date).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="flex items-center text-sm text-slate-400">
                                                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                                                            {booking.event.time}
                                                                        </div>
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {booking.event ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-slate-300">{booking.event.venue}</span>
                                                                        <span className="text-xs text-slate-500 truncate max-w-[200px]" title={booking.event.address}>{booking.event.address}</span>
                                                                    </div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 mb-1 group-hover:text-white transition-all">
                                                                    {booking.tickets}
                                                                </span>
                                                                <div className="text-xs text-indigo-400/0 group-hover:text-indigo-400 transition-all font-medium whitespace-nowrap">View Ticket &rarr;</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FanDashboard;
