import React from 'react';
import { Card, Form, Input, Select, Button, Alert, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../api/orders';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: (values) => createOrder(values),
  });

  const onFinish = async (values) => {
    try {
      const res = await mutateAsync(values);
      message.success('Заказ успешно создан');
      navigate(`/account`);
    } catch (e) {
      // handled by isError
    }
  };

  return (
    <Card title="Оформление заказа">
      {isError && <Alert type="error" message="Не удалось создать заказ" description={String(error?.message || 'Ошибка')} style={{ marginBottom: 16 }} />}
      <Typography.Paragraph>Заполните адрес доставки и выберите способ оплаты.</Typography.Paragraph>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ paymentMethod: 'cod' }}>
        <Form.Item label="Название адреса" name={["shippingAddress", "label"]} rules={[{ required: true, message: 'Укажите метку адреса' }]}>
          <Input placeholder="Дом, Офис и т.д." />
        </Form.Item>
        <Form.Item label="Страна" name={["shippingAddress", "country"]} rules={[{ required: true, message: 'Укажите страну' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Город" name={["shippingAddress", "city"]} rules={[{ required: true, message: 'Укажите город' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Улица" name={["shippingAddress", "street"]} rules={[{ required: true, message: 'Укажите улицу' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Индекс" name={["shippingAddress", "zip"]} rules={[{ required: true, message: 'Укажите индекс' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Способ оплаты" name="paymentMethod" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Наличными при получении', value: 'cod' },
              { label: 'Банковская карта (демо)', value: 'card-mock' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>Подтвердить заказ</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Checkout;
