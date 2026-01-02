const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/secret', auth, (req, res) => {
    res.json({
        message: "Bạn đã xác thực thành công!",
        user: req.user
    });
});

module.exports = router;
