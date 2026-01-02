import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, InputNumber, message } from "antd";
import axiosClient from "../../api/axiosClient";

export default function KhoanThuList() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/khoanthu");
            setData(res.data);
        } catch (err) {
            message.error("Lỗi tải dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editing) {
                // UPDATE
                await axiosClient.put(`/khoanthu/${editing.MaKhoanThu}`, values);
                message.success("Cập nhật thành công!");
            } else {
                // CREATE
                await axiosClient.post("/khoanthu", values);
                message.success("Thêm thành công!");
            }

            setOpen(false);
            form.resetFields();
            setEditing(null);
            loadData();

        } catch (err) {
            message.error("Lỗi thao tác!");
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Bạn có chắc muốn xóa?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/khoanthu/${id}`);
                    message.success("Xóa thành công!");
                    loadData();
                } catch (err) {
                    message.error("Không thể xóa!");
                }
            }
        });
    };

    const columns = [
        { title: "Mã", dataIndex: "MaKhoanThu" },
        { title: "Tên khoản thu", dataIndex: "TenKhoanThu" },
        { title: "Đơn giá", dataIndex: "DonGia" },
        { title: "Chu kỳ", dataIndex: "ChuKy" },
        { title: "Ghi chú", dataIndex: "GhiChu" },

        {
            title: "Hành động",
            render: (record) => (
                <Space>
                    <Button type="default">
                        <Link to={`/khoanthu/${record.MaKhoanThu}`}>Chi tiết</Link>
                    </Button>

                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue(record);
                            setOpen(true);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button danger onClick={() => handleDelete(record.MaKhoanThu)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Danh sách khoản thu</h2>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => {
                    setEditing(null);
                    form.resetFields();
                    setOpen(true);
                }}
            >
                Thêm khoản thu
            </Button>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="MaKhoanThu"
                bordered
            />

            <Modal
                title={editing ? "Sửa khoản thu" : "Thêm khoản thu"}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="MaKhoanThu"
                        label="Mã khoản thu"
                        rules={[{ required: true }]}
                    >
                        <Input disabled={!!editing} />
                    </Form.Item>

                    <Form.Item
                        name="TenKhoanThu"
                        label="Tên khoản thu"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="DonGia"
                        label="Đơn giá"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="ChuKy" label="Chu kỳ">
                        <Input />
                    </Form.Item>

                    <Form.Item name="GhiChu" label="Ghi chú">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
