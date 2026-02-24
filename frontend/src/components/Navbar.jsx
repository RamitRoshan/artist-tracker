import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 w-full bg-slate-900 border-b border-indigo-500/30 text-white shadow-lg shadow-indigo-500/10 z-[1000] backdrop-blur-md bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-indigo-500 p-2 rounded-lg group-hover:bg-indigo-400 transition-colors">
                            <MapPin className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Artisphere
                        </span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'artist' ? '/artist-dashboard' : '/fan-dashboard'}
                                    className="text-gray-300 hover:text-white font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-slate-700"></div>
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors hidden sm:flex font-medium"
                                    >
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                <span className="text-xs text-indigo-400">{user.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        )}
                                        <span>{user.name} ({user.role})</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-md"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Exit</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md font-medium transition-all shadow-md shadow-indigo-500/20"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
