const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sql, config } = require("../config/db");

// ===============================
// GET danh sách tạm trú
// ===============================
router.get("/", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const rs = await pool.request().query(`
            SELECT 
                TT.MaTamTru,
                TT.MaNhanKhau,
                NK.HoTen,
                NK.CanCuocCongDan,
                NK.NgaySinh,
                TT.NoiTamTru,
                TT.TuNgay,
                TT.DenNgay,
                TT.LyDo
            FROM TamTru TT
            JOIN NhanKhau NK ON TT.MaNhanKhau = NK.MaNhanKhau
            ORDER BY TT.MaTamTru DESC
        `);

        res.json(rs.recordset);

    } catch (err) {
        console.log("Get tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Tìm kiếm tạm trú  <-- ĐẶT LÊN TRÊN
// ===============================
router.get("/search/:keyword", auth, async (req, res) => {
    try {
        const kw = `%${req.params.keyword}%`;

        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("kw", sql.NVarChar, kw)
            .query(`
                SELECT 
                    TT.MaTamTru,
                    NK.HoTen,
                    NK.CanCuocCongDan,
                    TT.*
                FROM TamTru TT
                JOIN NhanKhau NK ON TT.MaNhanKhau = NK.MaNhanKhau
                WHERE NK.HoTen LIKE @kw
                   OR NK.CanCuocCongDan LIKE @kw
            `);

        res.json(rs.recordset);

    } catch (err) {
        console.log("Search tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// GET chi tiết tạm trú
// ===============================
router.get("/:id", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT 
                    TT.*,
                    NK.HoTen,
                    NK.CanCuocCongDan,
                    NK.NgaySinh,
                    NK.NoiSinh,
                    NK.DanToc,
                    NK.NgheNghiep
                FROM TamTru TT
                JOIN NhanKhau NK ON TT.MaNhanKhau = NK.MaNhanKhau
                WHERE TT.MaTamTru = @id
            `);

        res.json(rs.recordset[0]);

    } catch (err) {
        console.log("Detail tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Thêm tạm trú
// ===============================
router.post("/", auth, async (req, res) => {
    try {
        const { MaNhanKhau, NoiTamTru, TuNgay, DenNgay, LyDo } = req.body;

        if (!MaNhanKhau)
            return res.status(400).json({ error: "Thiếu mã nhân khẩu" });

        let pool = await sql.connect(config);

        await pool.request()
            .input("MaNhanKhau", sql.Int, MaNhanKhau)
            .input("NoiTamTru", sql.NVarChar, NoiTamTru)
            .input("TuNgay", sql.Date, TuNgay)
            .input("DenNgay", sql.Date, DenNgay)
            .input("LyDo", sql.NVarChar, LyDo)
            .query(`
                INSERT INTO TamTru (MaNhanKhau, NoiTamTru, TuNgay, DenNgay, LyDo)
                VALUES (@MaNhanKhau, @NoiTamTru, @TuNgay, @DenNgay, @LyDo)
            `);

        await pool.request()
            .input("MaNhanKhau", sql.Int, MaNhanKhau)
            .query(`
                UPDATE NhanKhau
                SET TrangThai = 2
                WHERE MaNhanKhau = @MaNhanKhau
            `);

        res.json({ message: "Đăng ký tạm trú thành công!" });

    } catch (err) {
        console.log("Add tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Sửa tạm trú
// ===============================
router.put("/:id", auth, async (req, res) => {
    try {
        const { NoiTamTru, TuNgay, DenNgay, LyDo } = req.body;

        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .input("NoiTamTru", sql.NVarChar, NoiTamTru)
            .input("TuNgay", sql.Date, TuNgay)
            .input("DenNgay", sql.Date, DenNgay)
            .input("LyDo", sql.NVarChar, LyDo)
            .query(`
                UPDATE TamTru
                SET NoiTamTru=@NoiTamTru, TuNgay=@TuNgay, DenNgay=@DenNgay, LyDo=@LyDo
                WHERE MaTamTru = @id
            `);

        res.json({ message: "Cập nhật tạm trú thành công!" });

    } catch (err) {
        console.log("Update tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Xóa tạm trú
// ===============================
router.delete("/:id", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const nk = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`SELECT MaNhanKhau FROM TamTru WHERE MaTamTru=@id`);

        const MaNhanKhau = nk.recordset[0]?.MaNhanKhau;

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`DELETE FROM TamTru WHERE MaTamTru = @id`);

        await pool.request()
            .input("MaNhanKhau", sql.Int, MaNhanKhau)
            .query(`
                UPDATE NhanKhau
                SET TrangThai = 1
                WHERE MaNhanKhau = @MaNhanKhau
            `);

        res.json({ message: "Xóa tạm trú thành công!" });

    } catch (err) {
        console.log("Delete tam tru error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
