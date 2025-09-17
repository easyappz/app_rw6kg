import React, { useMemo, useState } from 'react';
import { Card, Col, Row, Typography, Form, Select, InputNumber, Button, Pagination, List, Skeleton, Empty, Space, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/products';
import { listCategories } from '../api/categories';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function Catalog() {
  const navigate = useNavigate();
  const qp = useQueryParams();

  const [page, setPage] = useState(Number(qp.get('page')) || 1);
  const [limit, setLimit] = useState(12);
  const [filters, setFilters] = useState({
    category: qp.get('category') || undefined,
    priceMin: qp.get('priceMin') ? Number(qp.get('priceMin')) : undefined,
    priceMax: qp.get('priceMax') ? Number(qp.get('priceMax')) : undefined,
    sort: qp.get('sort') || 'createdAt_desc',
    q: qp.get('q') || undefined,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 1, 100],
    queryFn: () => listCategories({ page: 1, limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['products', { ...filters, page, limit }],
    queryFn: () => listProducts({ ...filters, page, limit }),
    keepPreviousData: true,
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  const total = typeof data?.total === 'number' ? data.total : items.length * Math.max(1, 3);

  const applyFilters = (values) => {
    const params = new URLSearchParams();
    if (values.category) params.set('category', values.category);
    if (values.priceMin !== undefined) params.set('priceMin', String(values.priceMin));
    if (values.priceMax !== undefined) params.set('priceMax', String(values.priceMax));
    if (values.sort) params.set('sort', values.sort);
    params.set('page', '1');
    setPage(1);
    setFilters((prev) => ({ ...prev, ...values }));
    navigate(`/catalog?${params.toString()}`);
    refetch();
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={applyFilters} initialValues={filters}>
          <Form.Item name="category" label="Категория">
            <Select
              allowClear
              placeholder="Все"
              style={{ minWidth: 180 }}
              options={(categoriesData?.items || []).map((c) => ({ label: c.name, value: c._id || c.slug }))}
            />
          </Form.Item>
          <Form.Item name="priceMin" label="Цена от">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="priceMax" label="до">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="sort" label="Сортировка">
            <Select style={{ minWidth: 200 }}
              options={[
                { label: 'Сначала новые', value: 'createdAt_desc' },
                { label: 'Сначала старые', value: 'createdAt_asc' },
                { label: 'Цена по возрастанию', value: 'price_asc' },
                { label: 'Цена по убыванию', value: 'price_desc' },
                { label: 'Рейтинг по возрастанию', value: 'rating_asc' },
                { label: 'Рейтинг по убыванию', value: 'rating_desc' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isFetching}>Применить</Button>
              <Button onClick={() => navigate('/catalog')}>Сбросить</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {isError && (
        <Alert type="error" message="Не удалось загрузить каталог" description={String(error?.message || 'Ошибка')} style={{ marginBottom: 16 }} />
      )}

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Col xs={12} sm={8} md={6} lg={6} key={i}>
              <Card>
                <Skeleton.Image style={{ width: '100%', height: 140 }} active />
                <Skeleton active paragraph={{ rows: 2 }} title style={{ marginTop: 12 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : items.length === 0 ? (
        <Empty description="Товары не найдены" />
      ) : (
        <>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={items}
            renderItem={(p) => (
              <List.Item key={p._id || p.slug}>
                <Card hoverable cover={<div style={{ height: 160, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Array.isArray(p.images) && p.images[0] ? (
                    <img src={p.images[0]} alt={p.title} style={{ maxHeight: 150, objectFit: 'contain' }} />
                  ) : (
                    <Typography.Text type="secondary">Изображение</Typography.Text>
                  )}
                </div>}>
                  <Typography.Title level={5} style={{ minHeight: 48 }}>{p.title || 'Товар'}</Typography.Title>
                  <Space align="baseline">
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {typeof p.price === 'number' ? `${p.price} ₽` : '—'}
                    </Typography.Title>
                  </Space>
                  <div style={{ marginTop: 12 }}>
                    <Link to={`/product/${p.slug || p._id}`}>Подробнее</Link>
                  </div>
                </Card>
              </List.Item>
            )}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger={false}
              onChange={(p) => {
                setPage(p);
                const params = new URLSearchParams(window.location.search);
                params.set('page', String(p));
                navigate(`/catalog?${params.toString()}`);
                refetch();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Catalog;
