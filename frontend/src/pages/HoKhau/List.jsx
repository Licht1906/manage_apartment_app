import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Space,
  Divider
} from "antd";
import dayjs from "dayjs";
import axiosClient from "../../api/axiosClient";

export default function HoKhauList() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      const res = await axiosClient.get("/hokhau");
      setData(res.data);
    } catch {
      message.error("Không tải được dữ liệu");
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
        message.success("Cập nhật thành công");
      } else {
        await axiosClient.post("/hokhau", values);
        message.success("Thêm hộ khẩu thành công");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xóa hộ khẩu?",
      onOk: async () => {
        await axiosClient.delete(`/hokhau/${id}`);
        message.success("Xóa thành công");
        loadData();
      }
    });
  };

  const columns = [
    { title: "Mã hộ khẩu", dataIndex: "MaHoKhau" },
    { title: "Địa chỉ", dataIndex: "DiaChiThuongTru" },
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
                NgayCap: dayjs(record.NgayCap),
                CanHo: record.CanHo
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

  const expandedRowRender = (record) => (
    <Table
      rowKey="MaCanHo"
      pagination={false}
      size="small"
      dataSource={record.CanHo}
      columns={[
        { title: "Tên căn hộ", dataIndex: "TenCanHo" },
        { title: "Tầng", dataIndex: "Tang" },
        { title: "Diện tích", dataIndex: "DienTich" },
        { title: "Mô tả", dataIndex: "MoTa" }
      ]}
    />
  );

  return (
    <div>
      <h2>Quản lý hộ khẩu</h2>

      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        }}
      >
        Thêm hộ khẩu
      </Button>

      <Table
        bordered
        rowKey="MaHoKhau"
        columns={columns}
        dataSource={data}
        expandable={{ expandedRowRender }}
      />

      <Modal
        open={open}
        title={editing ? "Sửa hộ khẩu" : "Thêm hộ khẩu"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        width={800}
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
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Divider>Danh sách căn hộ</Divider>

          <Form.List name="CanHo">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space
                    key={key}
                    direction="vertical"
                    style={{
                      width: "100%",
                      border: "1px solid #eee",
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 12
                    }}
                  >
                    <Form.Item
                      label="Tên căn hộ"
                      name={[name, "TenCanHo"]}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Tầng"
                      name={[name, "Tang"]}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Diện tích"
                      name={[name, "DienTich"]}
                      rules={[{ required: true }]}
                    >
                      <Input type="number" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name={[name, "MoTa"]}>
                      <Input.TextArea />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Xóa căn hộ
                    </Button>
                  </Space>
                ))}

                <Button type="dashed" onClick={() => add()} block>
                  + Thêm căn hộ
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
