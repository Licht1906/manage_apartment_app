import { useEffect, useState } from "react";
import { Card, Descriptions, Button, message } from "antd";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function KhoanThuDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    const loadData = async () => {
        try {
            const res = await axiosClient.get(`/khoanthu/${id}`);
            setData(res.data);
        } catch (err) {
            message.error("Không lấy được dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!data) return <p>Đang tải...</p>;

    return (
        <div>
            <Card
                title={`Chi tiết khoản thu: ${data.TenKhoanThu}`}
                extra={<Link to="/khoanthu"><Button>Quay lại</Button></Link>}
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã khoản thu">{data.MaKhoanThu}</Descriptions.Item>
                    <Descriptions.Item label="Tên khoản thu">{data.TenKhoanThu}</Descriptions.Item>
                    <Descriptions.Item label="Đơn giá">{data.DonGia}</Descriptions.Item>
                    <Descriptions.Item label="Chu kỳ">{data.ChuKy}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{data.GhiChu}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
}
