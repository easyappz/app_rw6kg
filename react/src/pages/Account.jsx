import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Tabs, Form, Input, Button, List, Typography, Tag, message } from 'antd';
import { me as meApi, updateProfile } from '../api/auth';
import { getMyOrders, getOrder } from '../api/orders';
import { formatPrice } from '../utils/format';

export default function Account() {
  const queryClient = useQueryClient();

  const { data: meData } = useQuery({ queryKey: ['me'], queryFn: () => meApi() });
  const user = meData?.user;

  const updateMutation = useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: (res) => {
      message.success('Профиль обновлён');
      // Refresh /me
      queryClient.invalidateQueries({ queryKey: ['me'] });
      // Update local user cache
      localStorage.setItem('user', JSON.stringify(res?.user || {}));
    },
    onError: (e) => message.error(e?.response?.data?.message || 'Ошибка обновления профиля'),
  });

  const { data: orders } = useQuery({ queryKey: ['orders', 'my', { page: 1, limit: 20 }], queryFn: () => getMyOrders({ page: 1, limit: 20 }) });

  const orderDetails = useMutation({
    mutationFn: (id) => getOrder(id),
  });

  return (
    <Tabs
      defaultActiveKey="profile"
      items={[
        {
          key: 'profile',
          label: 'Профиль',
          children: (
            <Card>
              <Form
                layout="vertical"
                initialValues={{ name: user?.name, phone: user?.phone, avatarUrl: user?.avatarUrl }}
                onFinish={(values) => updateMutation.mutate(values)}
              >
                <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Укажите имя' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Телефон" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item label="Аватар (URL)" name="avatarUrl">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Сохранить</Button>
                </Form.Item>
              </Form>
            </Card>
          ),
        },
        {
          key: 'orders',
          label: 'Мои заказы',
          children: (
            <Card>
              <List
                dataSource={orders?.items || []}
                locale={{ emptyText: 'Заказов пока нет' }}
                renderItem={(o) => (
                  <List.Item
                    actions={[
                      <Button key="view" onClick={async () => {
                        const res = await orderDetails.mutateAsync(o._id);
                        const order = res?.order || res;
                        const details = [
                          `Статус: ${order.status}`,
                          `Сумма: ${formatPrice(order.amount)}`,
                          `Оплата: ${order.paymentMethod}`,
                          `Товаров: ${Array.isArray(order.items) ? order.items.length : 0}`,
                        ].join('\n');
                        message.info(details);
                      }}>Детали</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Typography.Text strong>Заказ #{o._id}</Typography.Text>}
                      description={
                        <>
                          <div>Сумма: {formatPrice(o.amount)}</div>
                          <div>Создан: {new Date(o.createdAt).toLocaleString('ru-RU')}</div>
                          <div>
                            <Tag color="blue">{o.status}</Tag>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ),
        },
      ]}
    />
  );
}
