import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Typography, Skeleton, Divider } from 'antd';
import { listCategories } from '../api/categories';
import { listProducts } from '../api/products';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { data: categories, isLoading: loadingCats, error: catsError } = useQuery({
    queryKey: ['categories', { page: 1, limit: 12 }],
    queryFn: () => listCategories({ page: 1, limit: 12 }),
  });

  const { data: newest, isLoading: loadingNewest, error: newestError } = useQuery({
    queryKey: ['products', { page: 1, limit: 8, sort: 'createdAt_desc' }],
    queryFn: () => listProducts({ page: 1, limit: 8, sort: 'createdAt_desc', isActive: true }),
  });

  const { data: topRated, isLoading: loadingTop, error: topError } = useQuery({
    queryKey: ['products', { page: 1, limit: 8, sort: 'rating_desc' }],
    queryFn: () => listProducts({ page: 1, limit: 8, sort: 'rating_desc', isActive: true }),
  });

  return (
    <div>
      <Typography.Title level={2}>Популярные категории</Typography.Title>
      {loadingCats ? (
        <Skeleton active />
      ) : catsError ? (
        <Card type="inner" title="Ошибка" style={{ marginBottom: 24 }}>Не удалось загрузить категории</Card>
      ) : (
        <Row gutter={[16, 16]}>
          {(categories?.items || []).map((c) => (
            <Col xs={12} sm={8} md={6} lg={4} key={c._id}>
              <Card hoverable>
                <Typography.Text strong>{c.name}</Typography.Text>
                <div style={{ color: '#888', marginTop: 6 }}>{c.description || '—'}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Divider />

      <Typography.Title level={2}>Новинки</Typography.Title>
      {loadingNewest ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : newestError ? (
        <Card type="inner" title="Ошибка" style={{ marginBottom: 24 }}>Не удалось загрузить товары</Card>
      ) : (
        <Row gutter={[16, 16]}>
          {(newest?.items || []).map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}

      <Divider />

      <Typography.Title level={2}>Топ по рейтингу</Typography.Title>
      {loadingTop ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : topError ? (
        <Card type="inner" title="Ошибка" style={{ marginBottom: 24 }}>Не удалось загрузить товары</Card>
      ) : (
        <Row gutter={[16, 16]}>
          {(topRated?.items || []).map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
