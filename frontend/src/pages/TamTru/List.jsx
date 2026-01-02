import { useEffect, useState } from "react";
import { Table, Button, Input, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function TamTruList() {
    const [data, setData] = useState([]);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/tamtru");
            setData(res.data);
        } catch {
            message.error("Không tải được danh sách tạm trú!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = async () => {
        if (!keyword.trim()) return loadData();

        try {
            const res = await axiosClient.get(`/tamtru/search/${keyword}`);
            setData(res.data);
        } catch {
            message.error("Không thể tìm kiếm!");
        }
    };

    const deleteItem = async (id) => {
        try {
            await axiosClient.delete(`/tamtru/${id}`);
            message.success("Xóa tạm trú thành công!");
            loadData();
        } catch {
            message.error("Không thể xóa!");
        }
    };

    const columns = [
        { title: "Mã TT", dataIndex: "MaTamTru", width: 80 },
        { title: "Họ tên", dataIndex: "HoTen" },
        { title: "CCCD", dataIndex: "CanCuocCongDan" },
        { title: "Nơi tạm trú", dataIndex: "NoiTamTru" },
        { title: "Từ ngày", dataIndex: "TuNgay" },
        { title: "Đến ngày", dataIndex: "DenNgay" },
        {
            title: "Hành động",
            render: (_, r) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => navigate(`/tamtru/${r.MaTamTru}`)}
                    >
                        Chi tiết
                    </Button>

                    <Button danger onClick={() => deleteItem(r.MaTamTru)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>Quản lý tạm trú</h2>

            <Space style={{ marginBottom: 15 }}>
                <Input
                    placeholder="Tìm tên hoặc CCCD"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <Button onClick={handleSearch}>Tìm kiếm</Button>
            </Space>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => navigate("/tamtru/add")}
            >
                Thêm tạm trú
            </Button>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="MaTamTru"
                bordered
            />
        </div>
    );
}
