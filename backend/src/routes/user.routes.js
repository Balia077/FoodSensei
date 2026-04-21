const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
    res.send('user profile');
});

module.exports = router;