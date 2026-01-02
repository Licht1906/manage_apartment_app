const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sql, config } = require("../config/db");

// =====================================
// GET DANH SÁCH HÓA ĐƠN
// =====================================
router.get("/", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT 
                HD.MaHoaDon,
                HD.MaHoKhau,
                HK.DiaChiThuongTru AS DiaChi,
                HD.NgayTao,
                HD.TongTien
            FROM HoaDon HD
            LEFT JOIN HoKhau HK ON HD.MaHoKhau = HK.MaHoKhau
            ORDER BY HD.MaHoaDon DESC
        `);

        res.json(result.recordset);

    } catch (err) {
        console.log("Error get hoadon:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// =====================================
// GET CHI TIẾT HÓA ĐƠN
// =====================================
router.get("/:MaHoaDon", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        // Lấy thông tin hóa đơn
        const hd = await pool.request()
            .input("MaHoaDon", sql.Int, req.params.MaHoaDon)
            .query(`
                SELECT 
                    HD.MaHoaDon,
                    HD.MaHoKhau,
                    HK.DiaChiThuongTru AS DiaChi,
                    HD.NgayTao,
                    HD.TongTien
                FROM HoaDon HD
                LEFT JOIN HoKhau HK ON HD.MaHoKhau = HK.MaHoKhau
                WHERE HD.MaHoaDon = @MaHoaDon
            `);

        // Lấy chi tiết
        const ct = await pool.request()
            .input("MaHoaDon", sql.Int, req.params.MaHoaDon)
            .query(`
                SELECT MaCT, TenKhoanThu, SoTien
                FROM HoaDonChiTiet 
                WHERE MaHoaDon = @MaHoaDon
            `);

        res.json({
            info: hd.recordset[0],
            chitiet: ct.recordset
        });

    } catch (err) {
        console.log("Error get detail:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// =====================================
// TẠO HÓA ĐƠN
// =====================================
router.post("/", auth, async (req, res) => {
    try {
        const { MaHoKhau, NgayTao, Items } = req.body;

        if (!Items || Items.length === 0) {
            return res.status(400).json({
                error: "Hóa đơn phải có ít nhất 1 khoản thu"
            });
        }

        const pool = await sql.connect(config);

        let MaHoaDon;

        // ===============================
        // 1. TẠO HÓA ĐƠN (CÓ / KHÔNG CÓ NGÀY)
        // ===============================
        if (NgayTao) {
            // Có chọn ngày
            const hd = await pool.request()
                .input("MaHoKhau", sql.NVarChar, MaHoKhau)
                .input("NgayTao", sql.DateTime, NgayTao)
                .query(`
                    INSERT INTO HoaDon (MaHoKhau, NgayTao)
                    OUTPUT inserted.MaHoaDon
                    VALUES (@MaHoKhau, @NgayTao)
                `);

            MaHoaDon = hd.recordset[0].MaHoaDon;
        } else {
            // Không chọn ngày → dùng DEFAULT GETDATE()
            const hd = await pool.request()
                .input("MaHoKhau", sql.NVarChar, MaHoKhau)
                .query(`
                    INSERT INTO HoaDon (MaHoKhau)
                    OUTPUT inserted.MaHoaDon
                    VALUES (@MaHoKhau)
                `);

            MaHoaDon = hd.recordset[0].MaHoaDon;
        }

        // ===============================
        // 2. THÊM CHI TIẾT HÓA ĐƠN
        // ===============================
        for (const item of Items) {
            await pool.request()
                .input("MaHoaDon", sql.Int, MaHoaDon)
                .input("TenKhoanThu", sql.NVarChar, item.TenKhoanThu)
                .input("SoTien", sql.Int, item.SoTien)
                .query(`
                    INSERT INTO HoaDonChiTiet
                    (MaHoaDon, TenKhoanThu, SoTien)
                    VALUES
                    (@MaHoaDon, @TenKhoanThu, @SoTien)
                `);
        }

        // ===============================
        // 3. CẬP NHẬT TỔNG TIỀN
        // ===============================
        await pool.request()
            .input("MaHoaDon", sql.Int, MaHoaDon)
            .query(`
                UPDATE HoaDon
                SET TongTien = (
                    SELECT SUM(SoTien)
                    FROM HoaDonChiTiet
                    WHERE MaHoaDon = @MaHoaDon
                )
                WHERE MaHoaDon = @MaHoaDon
            `);

        res.json({
            message: "Tạo hóa đơn thành công",
            MaHoaDon
        });

    } catch (err) {
        console.log("Error create hoadon:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// =====================================
// XÓA HÓA ĐƠN
// =====================================
router.delete("/:MaHoaDon", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        // Xóa chi tiết trước
        await pool.request()
            .input("MaHoaDon", sql.Int, req.params.MaHoaDon)
            .query(`
                DELETE FROM HoaDonChiTiet WHERE MaHoaDon = @MaHoaDon
            `);

        // Xóa hóa đơn
        await pool.request()
            .input("MaHoaDon", sql.Int, req.params.MaHoaDon)
            .query(`
                DELETE FROM HoaDon WHERE MaHoaDon = @MaHoaDon
            `);

        res.json({ message: "Xóa hóa đơn thành công!" });

    } catch (err) {
        console.log("Error delete:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
