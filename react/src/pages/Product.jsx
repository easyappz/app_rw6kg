import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Carousel, Image, Row, Col, Typography, Space, Button, Rate, Input, List, message, Skeleton } from 'antd';
import { getProduct } from '../api/products';
import { listProductReviews, addReview } from '../api/reviews';
import { addOrUpdateItem } from '../api/cart';
import { getToken } from '../hooks/useAuth';
import { formatPrice } from '../utils/format';

export default function Product() {
  const { idOrSlug } = useParams();
  const token = getToken();
  const queryClient = useQueryClient();

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => getProduct(idOrSlug),
  });

  const product = useMemo(() => productData?.item || productData || null, [productData]);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: () => listProductReviews(product?._id),
    enabled: Boolean(product?._id),
  });

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, qty: q }) => addOrUpdateItem({ productId, qty: q }),
    onSuccess: () => {
      message.success('Товар добавлен в корзину');
    },
    onError: (e) => {
      message.error(e?.response?.data?.message || 'Не удалось добавить в корзину');
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: (data) => addReview(product._id, data),
    onSuccess: () => {
      message.success('Отзыв добавлен');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
    },
    onError: (e) => {
      message.error(e?.response?.data?.message || 'Не удалось добавить отзыв');
    },
  });

  const onAddToCart = () => {
    if (!token) {
      message.warning('Войдите в аккаунт, чтобы добавить в корзину');
      return;
    }
    if (!product?._id) return;
    addToCartMutation.mutate({ productId: product._id, qty: Math.max(1, Number(qty || 1)) });
  };

  if (isLoading) return <Card><Skeleton active /></Card>;
  if (error || !product) return <Card type="inner" title="Ошибка">Товар не найден</Card>;

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card>
            {images.length > 0 ? (
              <Carousel>
                {images.map((src, i) => (
                  <div key={i}>
                    <Image src={src} alt={product.title} style={{ objectFit: 'contain', height: 360 }} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>Нет изображения</div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card>
            <Typography.Title level={2}>{product.title}</Typography.Title>
            <Space align="center" style={{ marginBottom: 12 }}>
              <Rate disabled allowHalf defaultValue={Number(product.ratingAvg || 0)} />
              <Typography.Text type="secondary">{Number(product.reviewsCount || 0)} отзывов</Typography.Text>
            </Space>
            <Typography.Paragraph>{product.description}</Typography.Paragraph>
            <Typography.Title level={3}>{formatPrice(product.discountPrice || product.price)}</Typography.Title>
            <Space>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} style={{ width: 100 }} />
              <Button type="primary" onClick={onAddToCart} loading={addToCartMutation.isPending}>Добавить в корзину</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Отзывы">
            <List
              dataSource={Array.isArray(reviewsData?.items) ? reviewsData.items : (reviewsData || [])}
              locale={{ emptyText: 'Отзывов пока нет' }}
              renderItem={(it) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Space><Rate disabled defaultValue={Number(it.rating || 0)} /> <Typography.Text type="secondary">{new Date(it.createdAt).toLocaleDateString('ru-RU')}</Typography.Text></Space>}
                    description={it.comment || ''}
                  />
                </List.Item>
              )}
            />
            <div style={{ marginTop: 16 }}>
              <Typography.Title level={5}>Оставить отзыв</Typography.Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Rate value={rating} onChange={setRating} />
                <Input.TextArea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Ваш комментарий" />
                <Button
                  type="primary"
                  onClick={() => {
                    if (!getToken()) { message.warning('Войдите, чтобы оставить отзыв'); return; }
                    addReviewMutation.mutate({ rating, comment });
                  }}
                  loading={addReviewMutation.isPending}
                >Отправить</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
