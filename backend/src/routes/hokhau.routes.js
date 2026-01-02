const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy tất cả HoKhau
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM HoKhau');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Lấy HoKhau theo mã
router.get('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('SELECT * FROM HoKhau WHERE MaHoKhau = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy hộ khẩu' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm hộ khẩu
router.post('/', auth, async (req, res) => {
    const { MaHoKhau, DiaChiThuongTru, NoiCap, NgayCap } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaHoKhau', sql.NVarChar, MaHoKhau)
            .input('DiaChiThuongTru', sql.NVarChar, DiaChiThuongTru)
            .input('NoiCap', sql.NVarChar, NoiCap)
            .input('NgayCap', sql.Date, NgayCap)
            .query(`
                INSERT INTO HoKhau (MaHoKhau, DiaChiThuongTru, NoiCap, NgayCap)
                VALUES (@MaHoKhau, @DiaChiThuongTru, @NoiCap, @NgayCap)
            `);

        res.json({ message: 'Thêm hộ khẩu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Cập nhật hộ khẩu
router.put('/:id', auth, async (req, res) => {
    const { DiaChiThuongTru, NoiCap, NgayCap } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaHoKhau', sql.NVarChar, req.params.id)
            .input('DiaChiThuongTru', sql.NVarChar, DiaChiThuongTru)
            .input('NoiCap', sql.NVarChar, NoiCap)
            .input('NgayCap', sql.Date, NgayCap)
            .query(`
                UPDATE HoKhau
                SET DiaChiThuongTru = @DiaChiThuongTru,
                    NoiCap = @NoiCap,
                    NgayCap = @NgayCap
                WHERE MaHoKhau = @MaHoKhau
            `);

        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xoá hộ khẩu
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('DELETE FROM HoKhau WHERE MaHoKhau = @id');

        res.json({ message: 'Xoá thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/search/:keyword', auth, async (req, res) => {
    try {
        const keyword = `%${req.params.keyword}%`;

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('kw', sql.NVarChar, keyword)
            .query(`
                SELECT * FROM HoKhau
                WHERE MaHoKhau LIKE @kw
                   OR DiaChiThuongTru LIKE @kw
            `);

        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
