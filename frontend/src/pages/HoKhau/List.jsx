import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, message, Space } from "antd";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function HoKhauList() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/hokhau");
            setData(res.data);
        } catch (err) {
            message.error("Không tải được dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.NgayCap = values.NgayCap.format("YYYY-MM-DD");

            if (editing) {
                await axiosClient.put(`/hokhau/${editing.MaHoKhau}`, values);
                message.success("Cập nhật thành công!");
            } else {
                await axiosClient.post("/hokhau", values);
                message.success("Thêm hộ khẩu thành công!");
            }

            setOpen(false);
            form.resetFields();
            setEditing(null);
            loadData();

        } catch (err) {
            message.error("Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Bạn có chắc muốn xóa hộ khẩu?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/hokhau/${id}`);
                    message.success("Xóa thành công!");
                    loadData();
                } catch (err) {
                    message.error("Không thể xóa!");
                }
            }
        });
    };

    const columns = [
        { title: "Mã hộ khẩu", dataIndex: "MaHoKhau" },
        { title: "Địa chỉ thường trú", dataIndex: "DiaChiThuongTru" },
        { title: "Nơi cấp", dataIndex: "NoiCap" },
        { title: "Ngày cấp", dataIndex: "NgayCap" },

        {
            title: "Hành động",
            render: (record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue({
                                ...record,
                                NgayCap: dayjs(record.NgayCap)
                            });
                            setOpen(true);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button danger onClick={() => handleDelete(record.MaHoKhau)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Quản lý hộ khẩu</h2>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => {
                    setEditing(null);
                    form.resetFields();
                    setOpen(true);
                }}
            >
                Thêm hộ khẩu
            </Button>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="MaHoKhau"
                bordered
            />

            <Modal
                title={editing ? "Sửa hộ khẩu" : "Thêm hộ khẩu"}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Mã hộ khẩu"
                        name="MaHoKhau"
                        rules={[{ required: true }]}
                    >
                        <Input disabled={!!editing} />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ thường trú"
                        name="DiaChiThuongTru"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Nơi cấp"
                        name="NoiCap"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Ngày cấp"
                        name="NgayCap"
                        rules={[{ required: true }]}
                    >
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
