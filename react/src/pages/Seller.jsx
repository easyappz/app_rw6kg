import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Row, Col, List, Skeleton, Alert } from 'antd';
import { getSeller, listSellerProducts } from '../api/sellers';

function Seller() {
  const { id } = useParams();

  const { data: sellerData, isLoading: loadingSeller, isError: sellerError, error: sellerErr } = useQuery({
    queryKey: ['seller', id],
    queryFn: () => getSeller(id),
    enabled: Boolean(id),
  });

  const { data: productsData, isLoading: loadingProducts, isError: productsError, error: productsErr } = useQuery({
    queryKey: ['seller-products', id],
    queryFn: () => listSellerProducts(id, { page: 1, limit: 20 }),
    enabled: Boolean(id),
  });

  const seller = sellerData?.item || sellerData?.seller || sellerData || {};
  const items = Array.isArray(productsData?.items) ? productsData.items : [];

  return (
    <div>
      {sellerError && <Alert type="error" message="Не удалось загрузить продавца" description={String(sellerErr?.message || 'Ошибка')} style={{ marginBottom: 16 }} />}
      <Card loading={loadingSeller} style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>{seller.shopName || 'Продавец'}</Typography.Title>
        <Typography.Paragraph type="secondary">{seller.description || 'Описание продавца.'}</Typography.Paragraph>
      </Card>

      {productsError && <Alert type="error" message="Не удалось загрузить товары продавца" description={String(productsErr?.message || 'Ошибка')} style={{ marginBottom: 16 }} />}
      {loadingProducts ? (
        <Skeleton active />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={items}
          renderItem={(p) => (
            <List.Item key={p._id}>
              <Card
                hoverable
                cover={<div style={{ height: 140, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Array.isArray(p.images) && p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} style={{ maxHeight: 120, objectFit: 'contain' }} />
                  ) : 'Изображение'}
                </div>}
              >
                <Typography.Title level={5} style={{ minHeight: 40 }}>{p.title || 'Товар'}</Typography.Title>
                <Typography.Text strong>{typeof p.price === 'number' ? `${p.price} ₽` : '—'}</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Link to={`/product/${p.slug || p._id}`}>Подробнее</Link>
                </div>
              </Card>
            </List.Item>
          )}
        />)
      }
    </div>
  );
}

export default Seller;
