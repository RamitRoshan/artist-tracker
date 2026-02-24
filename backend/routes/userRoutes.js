const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.profilePicture = req.body.profilePicture || user.profilePicture;

            if (user.role === 'artist') {
                user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
                user.managerContact = req.body.managerContact !== undefined ? req.body.managerContact : user.managerContact;
                user.instagramId = req.body.instagramId !== undefined ? req.body.instagramId : user.instagramId;
            } else if (user.role === 'fan') {
                user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
                managerContact: updatedUser.managerContact,
                instagramId: updatedUser.instagramId,
                phone: updatedUser.phone,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
