const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sql, config } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT 1 AS test');
        res.json({ status: 'ok', db: result.recordset });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'DB error' });
    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const testRoutes = require('./routes/test.routes');
app.use('/test', testRoutes);

const hoKhauRoutes = require('./routes/hokhau.routes');
app.use('/hokhau', hoKhauRoutes);

const nhanKhauRoutes = require('./routes/nhankhau.routes');
app.use('/nhankhau', nhanKhauRoutes);

const tamTruRoutes = require('./routes/tamtru.routes');
app.use('/tamtru', tamTruRoutes);

const tamVangRoutes = require('./routes/tamvang.routes');
app.use('/tamvang', tamVangRoutes);

const canHoRoutes = require('./routes/canho.routes');
app.use('/canho', canHoRoutes);

const loaiXeRoutes = require('./routes/loaixe.routes');
const xeRoutes = require('./routes/xe.routes');

app.use('/loaixe', loaiXeRoutes);
app.use('/xe', xeRoutes);

//const khoanThuRoutes = require('./routes/khoanthu.routes');
//app.use('/khoanthu', khoanThuRoutes);

//const khoanThuTheoHoRoutes = require('./routes/khoanthutheoho.routes');
//app.use('/khoanthutheoho', khoanThuTheoHoRoutes);

const hoaDonRoutes = require('./routes/hoadon.routes');
app.use('/hoadon', hoaDonRoutes);

const thongKeRoutes = require('./routes/thongke.routes');
app.use('/thongke', thongKeRoutes);
