import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, Form, Input, Button, Radio, message, Result } from 'antd';
import { createOrder } from '../api/orders';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const [successOrder, setSuccessOrder] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => createOrder(data),
    onSuccess: (res) => {
      setSuccessOrder(res?.order || res);
      message.success('Заказ оформлен');
    },
    onError: (e) => {
      message.error(e?.response?.data?.message || 'Не удалось оформить заказ');
    },
  });

  if (successOrder) {
    return (
      <Result
        status="success"
        title="Заказ успешно оформлен"
        subTitle={`Номер заказа: ${successOrder._id}`}
        extra={[
          <Link key="acc" to="/account"><Button type="primary">Мои заказы</Button></Link>,
          <Link key="home" to="/"><Button>На главную</Button></Link>,
        ]}
      />
    );
  }

  return (
    <Card title="Оформление заказа">
      <Form
        layout="vertical"
        onFinish={(values) => {
          const payload = {
            shippingAddress: {
              label: values.label,
              country: values.country,
              city: values.city,
              street: values.street,
              zip: values.zip,
            },
            paymentMethod: values.paymentMethod,
          };
          mutation.mutate(payload);
        }}
        initialValues={{ paymentMethod: 'cod' }}
      >
        <Form.Item label="Название адреса" name="label" rules={[{ required: true, message: 'Укажите название адреса' }]}>
          <Input placeholder="Например: Дом" />
        </Form.Item>
        <Form.Item label="Страна" name="country" rules={[{ required: true, message: 'Укажите страну' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Город" name="city" rules={[{ required: true, message: 'Укажите город' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Улица" name="street" rules={[{ required: true, message: 'Укажите улицу' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Индекс" name="zip" rules={[{ required: true, message: 'Укажите индекс' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Способ оплаты" name="paymentMethod" rules={[{ required: true }] }>
          <Radio.Group>
            <Radio.Button value="cod">Наличными при получении</Radio.Button>
            <Radio.Button value="card-mock">Банковская карта (демо)</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>Подтвердить заказ</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
