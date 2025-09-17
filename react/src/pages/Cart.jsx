import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Empty, InputNumber, List, Space, Typography } from 'antd';
import { getCart, updateItem, removeItem, clearCart } from '../api/cart';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: Boolean(token),
  });

  const { mutateAsync: changeQty } = useMutation({
    mutationFn: ({ productId, qty }) => updateItem(productId, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (productId) => removeItem(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  const { mutateAsync: clear } = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });

  if (!token) {
    return (
      <Card>
        <Typography.Title level={4}>Корзина пуста</Typography.Title>
        <Typography.Paragraph>Войдите, чтобы увидеть вашу корзину.</Typography.Paragraph>
        <Space>
          <Link to="/auth/login"><Button type="primary">Войти</Button></Link>
          <Link to="/catalog"><Button>Перейти в каталог</Button></Link>
        </Space>
      </Card>
    );
  }

  if (isError) {
    return <Alert type="error" message="Не удалось загрузить корзину" description={String(error?.message || 'Ошибка')} />;
  }

  const items = data?.cart?.items || [];
  const amount = items.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.priceSnapshot) || 0), 0);

  return (
    <div>
      <Card title="Ваша корзина" extra={<Button danger onClick={clear} disabled={items.length === 0}>Очистить</Button>}>
        {isLoading ? (
          <Typography.Text>Загрузка...</Typography.Text>
        ) : items.length === 0 ? (
          <Empty description="Корзина пуста" />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(it) => (
                <List.Item
                  actions={[
                    <Space key="qty" align="center">
                      <Typography.Text>Кол-во:</Typography.Text>
                      <InputNumber min={0} value={it.qty} onChange={(v) => changeQty({ productId: it.product, qty: Number(v) || 0 })} />
                    </Space>,
                    <Button key="rm" danger onClick={() => remove(it.product)}>Удалить</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={it.imageSnapshot ? <img src={it.imageSnapshot} alt="img" width={56} height={56} style={{ objectFit: 'cover' }} /> : null}
                    title={<Link to={`/product/${it.product}`}>{it.titleSnapshot || 'Товар'}</Link>}
                    description={`${it.priceSnapshot} ₽`}
                  />
                </List.Item>
              )}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <Typography.Title level={4} style={{ margin: 0 }}>Итого: {amount} ₽</Typography.Title>
              <Button type="primary" size="large" onClick={() => navigate('/checkout')}>Оформить заказ</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default Cart;
