import { Form, Input, DatePicker, Button, message } from "antd";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function TamVangAdd() {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const submit = async () => {
        try {
            const values = await form.validateFields();

            await axiosClient.post("/tamvang", {
                ...values,
                TuNgay: values.TuNgay,
                DenNgay: values.DenNgay,
            });

            message.success("Thêm tạm vắng thành công!");
            navigate("/tamvang");
        } catch {
            message.error("Lỗi thêm tạm vắng!");
        }
    };

    return (
        <div>
            <h2>Thêm tạm vắng</h2>

            <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
                <Form.Item label="Mã nhân khẩu" name="MaNhanKhau" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Nơi đến" name="NoiDen" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Từ ngày" name="TuNgay" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Đến ngày" name="DenNgay">
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Lý do" name="LyDo" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Button type="primary" onClick={submit}>Lưu</Button>
            </Form>
        </div>
    );
}
