import { useEffect, useState } from "react";
import { Table, Button, Input, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function TamVangList() {
    const [data, setData] = useState([]);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/tamvang");
            setData(res.data);
        } catch (err) {
            message.error("Không tải được danh sách tạm vắng!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = async () => {
        try {
            const res = await axiosClient.get(`/tamvang/search/${keyword}`);
            setData(res.data);
        } catch {
            message.error("Không thể tìm kiếm!");
        }
    };

    const deleteItem = async (id) => {
        try {
            await axiosClient.delete(`/tamvang/${id}`);
            message.success("Xóa thành công!");
            loadData();
        } catch {
            message.error("Không thể xóa!");
        }
    };

    const columns = [
        { title: "Mã TV", dataIndex: "MaTamVang" },
        { title: "Họ tên", dataIndex: "HoTen" },
        { title: "CCCD", dataIndex: "CanCuocCongDan" },
        { title: "Nơi đến", dataIndex: "NoiDen" },
        { title: "Từ ngày", dataIndex: "TuNgay" },
        { title: "Đến ngày", dataIndex: "DenNgay" },
        {
            title: "Hành động",
            render: (_, r) => (
                <Space>
                    <Button type="primary" onClick={() => navigate(`/tamvang/${r.MaTamVang}`)}>
                        Chi tiết
                    </Button>
                    <Button danger onClick={() => deleteItem(r.MaTamVang)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>Quản lý tạm vắng</h2>

            <Space style={{ marginBottom: 15 }}>
                <Input placeholder="Tìm tên hoặc CCCD" onChange={(e) => setKeyword(e.target.value)} />
                <Button onClick={handleSearch}>Tìm kiếm</Button>
            </Space>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => navigate("/tamvang/add")}
            >
                Thêm tạm vắng
            </Button>

            <Table columns={columns} dataSource={data} rowKey="MaTamVang" bordered />
        </div>
    );
}
