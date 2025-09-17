import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const onFinish = () => {
    // Mock register
    message.success('Регистрация успешно выполнена');
    navigate('/auth/login');
  };

  return (
    <Card title="Регистрация">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Введите имя' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Зарегистрироваться</Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph>Уже есть аккаунт? <Link to="/auth/login">Войти</Link></Typography.Paragraph>
    </Card>
  );
}

export default Register;
