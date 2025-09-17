import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const onFinish = (values) => {
    // Mock login: save token only for demo layout
    localStorage.setItem('token', 'demo-token');
    message.success('Вы успешно вошли');
    navigate('/');
  };

  return (
    <Card title="Вход">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Войти</Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph>Нет аккаунта? <Link to="/auth/register">Зарегистрироваться</Link></Typography.Paragraph>
    </Card>
  );
}

export default Login;
