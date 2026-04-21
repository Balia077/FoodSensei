const express = require('express');
const router = express.Router();
const userModel = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('-password'); // Exclude password from the response
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User profile fetched successfully',
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;