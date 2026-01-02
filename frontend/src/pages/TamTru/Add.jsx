import { useState } from "react";
import {
    Card, Form, Input, Button, Modal, Table, DatePicker, Space, message
} from "antd";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function TamTruAdd() {

    // ===============================
    // SEARCH NHÂN KHẨU
    // ===============================
    const [nkList, setNkList] = useState([]);
    const [selectedNK, setSelectedNK] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchNK = async (keyword) => {
        if (!keyword.trim()) return;

        try {
            const res = await axiosClient.get(`/nhankhau/search/${keyword}`);
            setNkList(res.data);
        } catch {
            message.error("Không tìm thấy nhân khẩu");
        }
    };

    // ===============================
    // POPUP THÊM NHÂN KHẨU
    // ===============================
    const [openAddNK, setOpenAddNK] = useState(false);
    const [formNK] = Form.useForm();

    const createNK = async () => {
        try {
            const values = await formNK.validateFields();

            const res = await axiosClient.post("/nhankhau", values);

            message.success("Thêm nhân khẩu thành công!");
            const ma = res.data.MaNhanKhau;

            // gán vào nhân khẩu đang chọn
            setSelectedNK({
                MaNhanKhau: ma,
                ...values
            });

            setOpenAddNK(false);
            formNK.resetFields();
        } catch (err) {
            message.error("Lỗi thêm nhân khẩu!");
        }
    };

    // ===============================
    // FORM TẠM TRÚ
    // ===============================
    const [formTT] = Form.useForm();

    const submitTT = async () => {
        try {
            if (!selectedNK) {
                return message.error("Vui lòng chọn nhân khẩu!");
            }

            const values = await formTT.validateFields();

            await axiosClient.post("/tamtru", {
                MaNhanKhau: selectedNK.MaNhanKhau,
                NoiTamTru: values.NoiTamTru,
                TuNgay: values.TuNgay.format("YYYY-MM-DD"),
                DenNgay: values.DenNgay ? values.DenNgay.format("YYYY-MM-DD") : null,
                LyDo: values.LyDo || null
            });

            message.success("Đăng ký tạm trú thành công!");
            formTT.resetFields();
            setSelectedNK(null);

        } catch (err) {
            message.error("Lỗi đăng ký tạm trú!");
        }
    };

    return (
        <div>
            <h2>Đăng ký tạm trú</h2>

            {/* ===========================
                SEARCH THANH NHÂN KHẨU
            ============================== */}
            <Card title="Tìm kiếm nhân khẩu" style={{ marginBottom: 20 }}>
                <Space>
                    <Input.Search
                        placeholder="Nhập tên hoặc CCCD..."
                        enterButton="Tìm"
                        onSearch={searchNK}
                        style={{ width: 300 }}
                    />

                    <Button type="primary" onClick={() => setOpenAddNK(true)}>
                        Thêm nhân khẩu mới
                    </Button>
                </Space>

                <Table
                    dataSource={nkList}
                    rowKey="MaNhanKhau"
                    style={{ marginTop: 20 }}
                    bordered
                    onRow={(record) => ({
                        onClick: () => setSelectedNK(record),
                    })}
                    columns={[
                        { title: "Mã", dataIndex: "MaNhanKhau", width: 80 },
                        { title: "Họ tên", dataIndex: "HoTen" },
                        { title: "CCCD", dataIndex: "CanCuocCongDan" },
                        { title: "Ngày sinh", dataIndex: "NgaySinh" },
                    ]}
                />
            </Card>

            {/* ===========================
                NHÂN KHẨU ĐƯỢC CHỌN
            ============================== */}
            {selectedNK && (
                <Card title="Nhân khẩu đã chọn" style={{ marginBottom: 20 }}>
                    <p><b>Họ tên:</b> {selectedNK.HoTen}</p>
                    <p><b>CCCD:</b> {selectedNK.CanCuocCongDan}</p>
                </Card>
            )}

            {/* ===========================
                FORM TẠM TRÚ
            ============================== */}
            <Card title="Thông tin tạm trú">
                <Form form={formTT} layout="vertical">

                    <Form.Item
                        label="Nơi tạm trú"
                        name="NoiTamTru"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Từ ngày" name="TuNgay" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>

                    <Form.Item label="Đến ngày" name="DenNgay">
                        <DatePicker />
                    </Form.Item>

                    <Form.Item label="Lý do" name="LyDo">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Button type="primary" onClick={submitTT}>
                        Đăng ký tạm trú
                    </Button>

                </Form>
            </Card>

            {/* ===========================
                POPUP THÊM NHÂN KHẨU
            ============================== */}
            <Modal
                title="Thêm nhân khẩu mới"
                open={openAddNK}
                onCancel={() => setOpenAddNK(false)}
                onOk={createNK}
            >
                <Form form={formNK} layout="vertical">

                    <Form.Item label="Họ tên" name="HoTen" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="CCCD" name="CanCuocCongDan" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Ngày sinh" name="NgaySinh" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>

                    <Form.Item label="Nơi sinh" name="NoiSinh" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Dân tộc" name="DanToc" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Nghề nghiệp" name="NgheNghiep" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
}
