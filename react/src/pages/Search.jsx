import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/products';
import { Card, List, Typography, Empty, Skeleton, Alert } from 'antd';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Search() {
  const params = useQueryParams();
  const q = params.get('q') || '';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search', q],
    queryFn: () => listProducts({ q, page: 1, limit: 24 }),
    enabled: q.length > 0,
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Результаты поиска{q ? `: ${q}` : ''}</Typography.Title>
      {q.length === 0 ? (
        <Card><Typography.Text type="secondary">Введите запрос в поиске сверху.</Typography.Text></Card>
      ) : isLoading ? (
        <Skeleton active />
      ) : isError ? (
        <Alert type="error" message="Не удалось выполнить поиск" description={String(error?.message || 'Ошибка')} />
      ) : items.length === 0 ? (
        <Empty description="Ничего не найдено" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={items}
          renderItem={(p) => (
            <List.Item key={p._id}>
              <Card hoverable>
                <Typography.Title level={5} style={{ minHeight: 40 }}>{p.title}</Typography.Title>
                <Typography.Text strong>{typeof p.price === 'number' ? `${p.price} ₽` : '—'}</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Link to={`/product/${p.slug || p._id}`}>Подробнее</Link>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

export default Search;
