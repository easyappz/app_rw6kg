import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { login as loginApi } from '../api/auth';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <Card title="Вход" style={{ maxWidth: 420, margin: '0 auto' }}>
      <Form
        layout="vertical"
        onFinish={async (values) => {
          try {
            const res = await loginApi(values);
            login({ token: res.token, user: res.user });
            message.success('Добро пожаловать!');
            navigate('/');
          } catch (e) {
            message.error(e?.response?.data?.message || 'Ошибка входа');
          }
        }}
      >
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Войти</Button>
        </Form.Item>
        <Typography.Text>Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link></Typography.Text>
      </Form>
    </Card>
  );
}
