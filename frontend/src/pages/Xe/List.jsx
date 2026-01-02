import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message } from "antd";
import axiosClient from "../../api/axiosClient";

export default function XeList() {
    const [data, setData] = useState([]);
    const [loaiXeList, setLoaiXeList] = useState([]);
    const [nhanKhauList, setNhanKhauList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    // ===========================
    // TẢI DỮ LIỆU
    // ===========================
    const loadData = async () => {
        try {
            const resXe = await axiosClient.get("/xe");
            setData(resXe.data);

            const resLoai = await axiosClient.get("/xe/loaixe/list");
            setLoaiXeList(resLoai.data);

            const resNK = await axiosClient.get("/nhankhau");
            setNhanKhauList(resNK.data);

        } catch (err) {
            console.log(err);
            message.error("Không tải được dữ liệu xe!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ===========================
    // GỬI FORM
    // ===========================
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Chủ xe là khách → MaNhanKhau = null
            if (values.MaNhanKhau === "KHACH") {
                values.MaNhanKhau = null;
            }

            if (editing) {
                await axiosClient.put(`/xe/${editing.MaXe}`, values);
                message.success("Cập nhật thành công!");
            } else {
                await axiosClient.post("/xe", values);
                message.success("Thêm xe thành công!");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            loadData();

        } catch (err) {
            console.log(err);
            message.error("Lỗi thao tác!");
        }
    };

    // ===========================
    // XÓA XE
    // ===========================
    const handleDelete = async (MaXe) => {
        Modal.confirm({
            title: "Xóa xe này?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/xe/${MaXe}`);
                    message.success("Xóa thành công!");
                    loadData();
                } catch {
                    message.error("Không thể xóa xe này");
                }
            },
        });
    };

    // ===========================
    // CỘT BẢNG
    // ===========================
    const columns = [
        { title: "Mã xe", dataIndex: "MaXe" },
        { title: "Biển số", dataIndex: "BienSo" },
        { title: "Tên xe", dataIndex: "TenXe" },
        { title: "Chủ xe", dataIndex: "TenChuXe" },
        { title: "Loại xe", dataIndex: "TenLoai" },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue({
                                ...record,
                                MaNhanKhau: record.MaNhanKhau || "KHACH",
                            });
                            setOpen(true);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button danger onClick={() => handleDelete(record.MaXe)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h2>Quản lý xe</h2>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => {
                    setEditing(null);
                    form.resetFields();
                    setOpen(true);
                }}
            >
                Thêm xe
            </Button>

            <Table columns={columns} dataSource={data} rowKey="MaXe" bordered />

            {/* ============ MODAL ============ */}
            <Modal
                title={editing ? "Sửa xe" : "Thêm xe"}
                open={open}
                onOk={handleSubmit}
                onCancel={() => {
                    setOpen(false);
                    setEditing(null);
                    form.resetFields();
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Biển số"
                        name="BienSo"
                        rules={[{ required: true, message: "Nhập biển số" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Tên xe"
                        name="TenXe"
                        rules={[{ required: true, message: "Nhập tên xe" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Loại xe"
                        name="MaLoaiXe"
                        rules={[{ required: true, message: "Chọn loại xe" }]}
                    >
                        <Select placeholder="Chọn loại xe">
                            {loaiXeList.map((lx) => (
                                <Select.Option key={lx.MaLoaiXe} value={lx.MaLoaiXe}>
                                    {lx.TenLoai}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Chủ xe" name="MaNhanKhau" rules={[{ required: true }]}>
                        <Select placeholder="Chọn chủ xe">
                            <Select.Option value="KHACH">Khách (không thuộc nhân khẩu)</Select.Option>
                            {nhanKhauList.map((nk) => (
                                <Select.Option key={nk.MaNhanKhau} value={nk.MaNhanKhau}>
                                    {nk.HoTen}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Mô tả" name="MoTa">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
