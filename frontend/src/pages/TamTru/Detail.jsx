import { useEffect } from "react";
import { Form, Input, DatePicker, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function TamTruDetail() {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            const res = await axiosClient.get(`/tamtru/${id}`);

            if (!res.data) {
                message.error("Tạm trú không tồn tại");
                return;
            }

            form.setFieldsValue({
                ...res.data,
                TuNgay: res.data.TuNgay ? dayjs(res.data.TuNgay) : null,
                DenNgay: res.data.DenNgay ? dayjs(res.data.DenNgay) : null,
            });
        } catch {
            message.error("Không tải được dữ liệu tạm trú");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const save = async () => {
        try {
            const values = await form.validateFields();

            await axiosClient.put(`/tamtru/${id}`, values);
            message.success("Cập nhật tạm trú thành công!");
        } catch {
            message.error("Lỗi cập nhật!");
        }
    };

    return (
        <div>
            <h2>Chi tiết tạm trú</h2>

            <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
                <Form.Item label="Mã nhân khẩu" name="MaNhanKhau">
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Nơi tạm trú"
                    name="NoiTamTru"
                    rules={[{ required: true, message: "Nhập nơi tạm trú" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Từ ngày"
                    name="TuNgay"
                    rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Đến ngày" name="DenNgay">
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Lý do" name="LyDo">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Button type="primary" onClick={save}>
                    Lưu thay đổi
                </Button>

                <Button
                    style={{ marginLeft: 10 }}
                    onClick={() => navigate("/tamtru")}
                >
                    Quay lại
                </Button>
            </Form>
        </div>
    );
}
