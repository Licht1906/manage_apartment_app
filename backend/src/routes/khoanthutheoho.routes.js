const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy tất cả khoản thu theo hộ
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`
            SELECT KTH.*, 
                   HK.DiaChiThuongTru, 
                   KT.TenKhoanThu, KT.DonGia
            FROM KhoanThuTheoHo KTH
            JOIN HoKhau HK ON KTH.MaHoKhau = HK.MaHoKhau
            JOIN KhoanThu KT ON KTH.MaKhoanThu = KT.MaKhoanThu
        `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Lấy khoản thu theo hộ khẩu
router.get('/ho/:maHoKhau', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('maHoKhau', sql.NVarChar, req.params.maHoKhau)
            .query(`
                SELECT KTH.*, KT.TenKhoanThu, KT.DonGia
                FROM KhoanThuTheoHo KTH
                JOIN KhoanThu KT ON KTH.MaKhoanThu = KT.MaKhoanThu
                WHERE MaHoKhau = @maHoKhau
            `);

        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm khoản thu cho hộ khẩu
router.post('/', auth, async (req, res) => {
    const { MaHoKhau, MaKhoanThu, SoTien } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaHoKhau', sql.NVarChar, MaHoKhau)
            .input('MaKhoanThu', sql.NVarChar, MaKhoanThu)
            .input('SoTien', sql.Int, SoTien)
            .query(`
                INSERT INTO KhoanThuTheoHo (MaHoKhau, MaKhoanThu, SoTien)
                VALUES (@MaHoKhau, @MaKhoanThu, @SoTien)
            `);

        res.json({ message: 'Thêm khoản thu cho hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Cập nhật khoản thu của hộ khẩu
router.put('/:id', auth, async (req, res) => {
    const { SoTien } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('Id', sql.Int, req.params.id)
            .input('SoTien', sql.Int, SoTien)
            .query(`
                UPDATE KhoanThuTheoHo
                SET SoTien = @SoTien
                WHERE Id = @Id
            `);

        res.json({ message: 'Cập nhật khoản thu theo hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xóa khoản thu của hộ khẩu
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('Id', sql.Int, req.params.id)
            .query('DELETE FROM KhoanThuTheoHo WHERE Id = @Id');

        res.json({ message: 'Xóa khoản thu theo hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
