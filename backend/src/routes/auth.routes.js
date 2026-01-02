const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, config } = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        let user = result.recordset[0];

        const valid = await bcrypt.compare(password, user.Password);
        if (!valid) {
            return res.status(400).json({ error: 'Wrong password' });
        }

        const token = jwt.sign(
            { 
                id: user.Id,
                username: user.Username,
                ho: user.Ho,
                ten: user.Ten
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ 
            message: "Login success",
            token,
            info: {
                id: user.Id,
                ho: user.Ho,
                ten: user.Ten,
                email: user.Email
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/test', (req, res) => {
    res.send("Auth route OK");
});

// Đăng ký tài khoản
router.post('/register', async (req, res) => {
    const { username, password, ho, ten, email } = req.body;

    try {
        let pool = await sql.connect(config);

        // Kiểm tra username tồn tại
        let check = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        if (check.recordset.length > 0) {
            return res.status(400).json({ error: 'Username đã tồn tại!' });
        }

        // Mã hóa mật khẩu
        const hashed = await bcrypt.hash(password, 10);

        // Thêm user mới
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashed)
            .input('ho', sql.NVarChar, ho)
            .input('ten', sql.NVarChar, ten)
            .input('email', sql.NVarChar, email)
            .query(`
                INSERT INTO Users (Username, Password, Ho, Ten, Email)
                VALUES (@username, @password, @ho, @ten, @email)
            `);

        res.json({ message: 'Đăng ký thành công!' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Đăng ký thất bại' });
    }
});

module.exports = router;
