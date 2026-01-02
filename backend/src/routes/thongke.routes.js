const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// ========================================
// DOANH THU THEO THÁNG
// ========================================
router.get('/doanhthu/thang/:month/:year', auth, async (req, res) => {
    const { month, year } = req.params;

    try {
        let pool = await sql.connect(config);

        const result = await pool.request()
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query(`
                SELECT 
                    SUM(TongTien) AS DoanhThu
                FROM HoaDon
                WHERE MONTH(NgayTao) = @month
                  AND YEAR(NgayTao) = @year
            `);

        res.json(result.recordset[0] || { DoanhThu: 0 });

    } catch (err) {
        console.log("Error doanhthu thang:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ========================================
// DOANH THU THEO NĂM (tổng từng tháng)
// ========================================
router.get('/doanhthu/nam/:year', auth, async (req, res) => {
    const { year } = req.params;

    try {
        let pool = await sql.connect(config);

        const result = await pool.request()
            .input('year', sql.Int, year)
            .query(`
                SELECT 
                    MONTH(NgayTao) AS Thang,
                    SUM(TongTien) AS DoanhThu
                FROM HoaDon
                WHERE YEAR(NgayTao) = @year
                GROUP BY MONTH(NgayTao)
                ORDER BY Thang
            `);

        res.json(result.recordset);

    } catch (err) {
        console.log("Error doanhthu nam:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ========================================
// DASHBOARD TỔNG QUAN
// ========================================
router.get('/dashboard', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const hk = await pool.request().query(`SELECT COUNT(*) AS TongHoKhau FROM HoKhau`);
        const nk = await pool.request().query(`SELECT COUNT(*) AS TongNhanKhau FROM NhanKhau`);
        const xe = await pool.request().query(`SELECT COUNT(*) AS TongXe FROM Xe`);
        const hd = await pool.request().query(`SELECT COUNT(*) AS TongHoaDon FROM HoaDon`);

        res.json({
            tongHoKhau: hk.recordset[0].TongHoKhau,
            tongNhanKhau: nk.recordset[0].TongNhanKhau,
            tongXe: xe.recordset[0].TongXe,
            tongHoaDon: hd.recordset[0].TongHoaDon
        });

    } catch (err) {
        console.log("Error dashboard:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Thống kê trạng thái nhân khẩu
// ===============================
router.get("/trangthai-nhankhau", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const rs = await pool.request().query(`
            SELECT 
                TrangThai,
                COUNT(*) AS SoLuong
            FROM NhanKhau
            GROUP BY TrangThai
        `);

        res.json(rs.recordset);

    } catch (err) {
        console.log("Error trangthai NK:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
