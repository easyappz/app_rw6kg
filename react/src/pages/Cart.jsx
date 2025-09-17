import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCart, updateItem, removeItem, clearCart } from '../api/cart';
import { Card, List, Image, Button, Space, InputNumber, Typography, message, Result } from 'antd';
import { formatPrice } from '../utils/format';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../hooks/useAuth';

export default function Cart() {
  const navigate = useNavigate();
  const token = getToken();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(),
    enabled: Boolean(token),
  });

  const items = useMemo(() => (data?.cart?.items || []), [data]);

  const total = useMemo(() => items.reduce((sum, it) => sum + Number(it.priceSnapshot || 0) * Number(it.qty || 0), 0), [items]);

  const patchQty = useMutation({
    mutationFn: ({ productId, qty }) => updateItem(productId, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (e) => message.error(e?.response?.data?.message || 'Ошибка обновления количества'),
  });

  const remove = useMutation({
    mutationFn: (productId) => removeItem(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (e) => message.error(e?.response?.data?.message || 'Ошибка удаления позиции'),
  });

  const clear = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (e) => message.error(e?.response?.data?.message || 'Ошибка очистки корзины'),
  });

  if (!token) {
    return (
      <Result
        status="403"
        title="Требуется авторизация"
        subTitle="Войдите в аккаунт, чтобы просмотреть корзину"
        extra={<Link to="/login"><Button type="primary">Войти</Button></Link>}
      />
    );
  }

  if (isLoading) return <Card loading />;
  if (error) return <Card type="inner" title="Ошибка">Не удалось загрузить корзину</Card>;

  return (
    <div>
      <Card title={`Корзина (${items.length})`} extra={<Button danger onClick={() => clear.mutate()} disabled={items.length === 0}>Очистить</Button>}>
        <List
          dataSource={items}
          locale={{ emptyText: 'Корзина пуста' }}
          renderItem={(it) => (
            <List.Item
              actions={[
                <Space key="qty">
                  <span>Кол-во:</span>
                  <InputNumber min={0} value={it.qty} onChange={(v) => patchQty.mutate({ productId: it.product, qty: Number(v || 0) })} />
                </Space>,
                <Button key="rm" danger onClick={() => remove.mutate(it.product)}>Удалить</Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Image src={it.imageSnapshot} width={64} height={64} style={{ objectFit: 'cover' }} />}
                title={it.titleSnapshot}
                description={formatPrice(it.priceSnapshot)}
              />
            </List.Item>
          )}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Итого: {formatPrice(total)}</Typography.Title>
          <Button type="primary" disabled={items.length === 0} onClick={() => navigate('/checkout')}>Оформить заказ</Button>
        </div>
      </Card>
    </div>
  );
}
