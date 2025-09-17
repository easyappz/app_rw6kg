import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { register as registerApi } from '../api/auth';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <Card title="Регистрация" style={{ maxWidth: 480, margin: '0 auto' }}>
      <Form
        layout="vertical"
        onFinish={async (values) => {
          try {
            const res = await registerApi(values);
            login({ token: res.token, user: res.user });
            message.success('Регистрация успешна');
            navigate('/');
          } catch (e) {
            message.error(e?.response?.data?.message || 'Ошибка регистрации');
          }
        }}
        initialValues={{ name: '', email: '' }}
      >
        <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Введите имя' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }, { min: 6, message: 'Минимум 6 символов' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Создать аккаунт</Button>
        </Form.Item>
        <Typography.Text>Уже есть аккаунт? <Link to="/login">Войти</Link></Typography.Text>
      </Form>
    </Card>
  );
}
