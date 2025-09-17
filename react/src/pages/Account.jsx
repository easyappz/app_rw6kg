import React from 'react';
import { Card, Tabs, List, Typography, Alert, Empty, Skeleton } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { listMyOrders } from '../api/orders';

function Account() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-orders', { page: 1, limit: 20 }],
    queryFn: () => listMyOrders({ page: 1, limit: 20 }),
    enabled: Boolean(token),
  });

  if (!token) {
    return (
      <Card>
        <Typography.Title level={4}>Личный кабинет</Typography.Title>
        <Typography.Paragraph>Войдите, чтобы просмотреть профиль и заказы.</Typography.Paragraph>
      </Card>
    );
  }

  return (
    <Card>
      <Tabs
        items={[
          {
            key: 'orders',
            label: 'Мои заказы',
            children: (
              isLoading ? (
                <Skeleton active />
              ) : isError ? (
                <Alert type="error" message="Не удалось загрузить заказы" description={String(error?.message || 'Ошибка')} />
              ) : (
                (Array.isArray(data?.items) && data.items.length > 0) ? (
                  <List
                    dataSource={data.items}
                    renderItem={(o) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`Заказ #${o._id || ''}`}
                          description={`Статус: ${o.status || '—'} | Сумма: ${o.amount || 0} ₽`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Заказы не найдены" />
                )
              )
            )
          },
        ]}
      />
    </Card>
  );
}

export default Account;
