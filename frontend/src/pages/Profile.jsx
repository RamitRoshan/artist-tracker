import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Camera, Save, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        profilePicture: '',
        bio: '',
        managerContact: '',
        instagramId: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`);
            setProfile(data);
            setFormData({
                name: data.name || '',
                profilePicture: data.profilePicture || '',
                bio: data.bio || '',
                managerContact: data.managerContact || '',
                instagramId: data.instagramId || '',
                phone: data.phone || '',
                password: ''
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile', err);
            setError('Failed to load profile details.');
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('+91 ')) {
            val = '+91 ' + val.replace(/^\+91\s*/, '');
        }
        setFormData({ ...formData, phone: val });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const updatePayload = { ...formData };
            if (!updatePayload.password) {
                delete updatePayload.password;
            }

            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, updatePayload);
            setProfile(data);

            // Clear password field after save
            setFormData(prev => ({ ...prev, password: '' }));

            // Update auth context name if changed
            if (updatePayload.name) {
                const currentUserData = JSON.parse(localStorage.getItem('user'));
                currentUserData.name = data.name;
                localStorage.setItem('user', JSON.stringify(currentUserData));
                // We could also call setting user inside AuthContext if needed, but page reload or full state sync would be better.
                // For simplicity, local state update is fine.
            }

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-slate-200">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
                <div className="border-b border-slate-800 pb-6">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Profile</h1>
                    <p className="mt-2 text-slate-400">Manage your personal information and preferences.</p>
                </div>

                {message && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-6 py-4 rounded-xl flex items-center font-medium shadow-lg animate-in slide-in-from-top-4">
                        <CheckCircle className="w-5 h-5 mr-3" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center font-medium shadow-lg">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        {error}
                    </div>
                )}

                <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-700/50">
                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700/50 bg-slate-800 relative shadow-2xl">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white">Profile Picture</h3>
                                <p className="text-sm text-slate-400 mt-1">Upload a new avatar. Large images will be resized.</p>
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row text-xs font-medium text-slate-500">
                                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
                                    <span className="hidden sm:inline mx-2">•</span>
                                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Last Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* General Fields */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">Account Info</h3>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5 font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5 font-medium">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-500 cursor-not-allowed"
                                        value={profile.email}
                                    />
                                    <p className="text-xs text-slate-500 mt-1.5">Email cannot be changed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5 font-medium">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Leave blank to keep unchanged"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Role Specific Fields */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700/50 pb-2">
                                    {user.role === 'artist' ? 'Artist Details' : 'Fan Details'}
                                </h3>

                                {user.role === 'artist' && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Bio</label>
                                            <textarea
                                                name="bio"
                                                rows="3"
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white resize-none"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                placeholder="Tell fans about yourself..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Manager Contact (Email/Phone)</label>
                                            <input
                                                type="text"
                                                name="managerContact"
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white"
                                                value={formData.managerContact}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Instagram Link</label>
                                            <input
                                                type="url"
                                                name="instagramId"
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white"
                                                value={formData.instagramId}
                                                onChange={handleInputChange}
                                                placeholder="https://instagram.com/yourhandle"
                                            />
                                        </div>
                                    </>
                                )}

                                {user.role === 'fan' && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-1.5 font-medium">Phone Number (India)</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-white"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                placeholder="+91 9876543210"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-700/50 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`flex items-center px-8 py-3.5 rounded-xl font-bold transition-all duration-300 ${saving ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 text-white'}`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
