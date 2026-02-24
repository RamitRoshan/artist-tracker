import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Music, Ticket } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const Home = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        if (event.location && event.location.coordinates) {
            mapRef.current?.flyTo({
                center: [event.location.coordinates[0], event.location.coordinates[1]],
                zoom: 14,
                duration: 1500
            });
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, []);

    const handleBookTicket = () => {
        navigate('/login');
    };

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full flex flex-col md:flex-row bg-slate-900 border-t border-slate-800">
            {/* Sidebar List */}
            <div className="md:w-[450px] w-full h-1/2 md:h-full overflow-y-auto bg-slate-900 shadow-xl border-r border-slate-800 z-10 custom-scrollbar">
                <div className="p-8 pb-4 bg-gradient-to-b from-indigo-950/40 to-transparent sticky top-0 backdrop-blur-md z-20 border-b border-indigo-500/10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Explore Live Music</h2>
                    <p className="text-slate-400 font-medium">
                        <span className="text-indigo-400 font-bold">{events.length}</span> upcoming performances worldwide
                    </p>
                </div>

                <div className="p-4 space-y-4">
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-800/20">
                            <Music className="w-12 h-12 mb-4 text-slate-600" />
                            <p className="text-lg">No upcoming events found.</p>
                            <p className="text-sm mt-1">Check back later for new dates!</p>
                        </div>
                    ) : (
                        events.map(event => (
                            <div
                                key={event._id}
                                className="group p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
                                onClick={() => handleEventClick(event)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{event.title}</h3>
                                        <div className="flex items-center mt-1.5 space-x-2">
                                            {event.artist?.profilePicture ? (
                                                <img src={event.artist.profilePicture} alt="Artist" className="w-5 h-5 rounded-full object-cover border border-slate-700" />
                                            ) : (
                                                <Music className="w-4 h-4 text-indigo-400" />
                                            )}
                                            <p className="text-indigo-400 font-medium text-sm">
                                                {event.artist?.name || 'Unknown Artist'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 text-indigo-400">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 text-sm text-slate-300">
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-slate-200">{event.venue}</p>
                                            <p className="text-slate-500 mt-0.5">{event.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-slate-400 bg-slate-900/50 w-max px-3 py-1.5 rounded-lg border border-slate-700/50 mt-2">
                                        <span className="font-semibold text-slate-200">{new Date(event.date).toLocaleDateString()}</span>
                                        <span className="mx-2 text-slate-600">•</span>
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 h-1/2 md:h-full relative bg-slate-800">
                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: -74.006,
                        latitude: 40.7128,
                        zoom: 3
                    }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                    <NavigationControl position="bottom-right" />

                    {events.map((event) => (
                        event.location && event.location.coordinates && (
                            <Marker
                                key={event._id}
                                longitude={event.location.coordinates[0]}
                                latitude={event.location.coordinates[1]}
                                color="#ef4444" // red
                                onClick={e => {
                                    e.originalEvent.stopPropagation();
                                    handleEventClick(event);
                                }}
                            />
                        )
                    ))}

                    {selectedEvent && selectedEvent.location && selectedEvent.location.coordinates && (
                        <Popup
                            longitude={selectedEvent.location.coordinates[0]}
                            latitude={selectedEvent.location.coordinates[1]}
                            anchor="bottom"
                            onClose={() => setSelectedEvent(null)}
                            closeButton={true}
                            closeOnClick={false}
                            className="custom-popup"
                        >
                            <div className="p-4 rounded-xl min-w-[280px]">
                                <h3 className="font-bold text-lg text-slate-900 mb-1">{selectedEvent.title}</h3>
                                <p className="text-indigo-600 font-semibold text-sm mb-3 border-b border-indigo-100 pb-2">
                                    by {selectedEvent.artist?.name || 'Unknown Artist'}
                                </p>

                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <p className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="truncate" title={selectedEvent.venue}>{selectedEvent.venue}</span>
                                    </p>
                                    <p className="flex items-center text-xs ml-6 text-slate-400">
                                        {selectedEvent.address}
                                    </p>
                                    <p className="flex items-center mt-2">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        <span className="font-medium text-slate-700">
                                            {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleBookTicket}
                                    className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md shadow-indigo-500/20"
                                >
                                    <Ticket className="w-4 h-4 mr-2" />
                                    Book Tickets
                                </button>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
        </div>
    );
};

export default Home;
