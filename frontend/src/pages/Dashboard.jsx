import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, message } from "antd";
import axiosClient from "../api/axiosClient";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { PieChart, Pie, Legend, Cell } from "recharts";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const COLORS = ["#1890ff", "#52c41a", "#faad14"];

    const loadDashboard = async () => {
        try {
            const res = await axiosClient.get("/thongke/dashboard");
            setData(res.data);
        } catch (err) {
            message.error("Không tải được dữ liệu dashboard!");
        }
    };

    const loadChart = async () => {
        try {
            const year = new Date().getFullYear();
            const res = await axiosClient.get(`/thongke/doanhthu/nam/${year}`);

            const months = Array.from({ length: 12 }, (_, i) => i + 1);

            const formatted = months.map((month) => {
                const found = res.data.find((item) => item.Thang === month);
                return {
                    thang: month,
                    tong: found ? found.DoanhThu : 0,
                };
            });

            setChartData(formatted);

        } catch (err) {
            message.error("Không tải được biểu đồ doanh thu!");
        }
    };

    const loadPie = async () => {
        try {
            const res = await axiosClient.get("/thongke/trangthai-nhankhau");

            const mapStatus = {
                1: "Thường trú",
                2: "Tạm trú",
                3: "Tạm vắng"
            };

            const formatted = res.data.map(item => ({
                name: mapStatus[item.TrangThai] || "Khác",
                value: item.SoLuong
            }));

            setPieData(formatted);

        } catch (err) {
            message.error("Không tải được biểu đồ trạng thái!");
        }
    };

    useEffect(() => {
        loadDashboard();
        loadChart();
        loadPie();
    }, []);

    if (!data) return <p>Đang tải dữ liệu...</p>;

    return (
        <div>
            <h2>Dashboard thống kê</h2>

            <Row gutter={20} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng hộ khẩu" value={data.tongHoKhau} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng nhân khẩu" value={data.tongNhanKhau} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng số xe" value={data.tongXe} />
                    </Card>
                </Col>

                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số hóa đơn"
                            value={data.tongHoaDon}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Doanh thu theo tháng (VNĐ)">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="thang" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="tong" fill="#1890ff" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Trạng thái nhân khẩu">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>

                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            label={({ name, value }) => `${name}: ${value}`}
                            labelLine={false}
                        >
                            {pieData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        {/* Chú thích */}
                        <Tooltip formatter={(v, _, item) => [`${v} người`, item.payload.name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
}
