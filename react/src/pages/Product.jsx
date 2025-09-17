import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Space, Button, Carousel, Skeleton, Alert, message } from 'antd';
import { getProduct, listProductReviews } from '../api/products';
import { addOrUpdateItem } from '../api/cart';

function Product() {
  const { idOrSlug } = useParams();
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug),
    enabled: Boolean(idOrSlug),
  });

  const product = data?.item || data?.product || data || {};
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/logo512.png'];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (qty) => addOrUpdateItem({ productId: product._id, qty }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      message.success('Товар добавлен в корзину');
    },
  });

  return (
    <div>
      {isError && (
        <Alert type="error" message="Не удалось загрузить товар" description={String(error?.message || 'Ошибка')} style={{ marginBottom: 16 }} />
      )}
      {isLoading ? (
        <Skeleton active />
      ) : (
        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <Carousel dotPosition="bottom">
                {images.map((src, i) => (
                  <div key={i} style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                    <img src={src} alt={`img-${i}`} style={{ maxHeight: 300, objectFit: 'contain' }} />
                  </div>
                ))}
              </Carousel>
            </Col>
            <Col xs={24} md={14}>
              <Typography.Title level={3} style={{ marginTop: 0 }}>{product.title || 'Название товара'}</Typography.Title>
              <Typography.Paragraph type="secondary">{product.description || 'Описание товара будет здесь.'}</Typography.Paragraph>
              <Space size="large" style={{ margin: '12px 0' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {typeof product.price === 'number' ? `${product.price} ₽` : '—'}
                </Typography.Title>
                {typeof product.discountPrice === 'number' && (
                  <Typography.Text type="success">Скидка: {product.discountPrice} ₽</Typography.Text>
                )}
              </Space>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  disabled={!product._id}
                  loading={isPending}
                  onClick={() => mutateAsync(1)}
                >
                  В корзину
                </Button>
              </Space>
              <div style={{ marginTop: 24 }}>
                <Typography.Title level={4}>Отзывы</Typography.Title>
                <Reviews productId={product._id} />
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}

function Reviews({ productId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => listProductReviews(productId),
    enabled: Boolean(productId),
  });

  if (isLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (isError) return <Typography.Text type="danger">Не удалось загрузить отзывы</Typography.Text>;

  const reviews = Array.isArray(data?.items) ? data.items : [];

  if (reviews.length === 0) return <Typography.Text type="secondary">Пока нет отзывов</Typography.Text>;

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {reviews.map((r) => (
        <Card key={r._id} size="small">
          <Typography.Text strong>Оценка: {r.rating}/5</Typography.Text>
          <div style={{ marginTop: 6 }}>{r.comment || 'Без комментария'}</div>
        </Card>
      ))}
    </Space>
  );
}

export default Product;
