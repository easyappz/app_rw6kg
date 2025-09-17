import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/products';
import { Row, Col, Typography, Card, Skeleton, Empty } from 'antd';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', q],
    queryFn: () => listProducts({ q, page: 1, limit: 24, isActive: true }),
    enabled: Boolean(q),
  });

  return (
    <div>
      <Typography.Title level={2}>Поиск: {q || 'запрос пуст'}</Typography.Title>
      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : error ? (
        <Card type="inner" title="Ошибка">Не удалось выполнить поиск</Card>
      ) : (data?.items || []).length === 0 ? (
        <Empty description="Ничего не найдено" />
      ) : (
        <Row gutter={[16, 16]}>
          {(data?.items || []).map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
