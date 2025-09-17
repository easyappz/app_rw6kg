import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../api/categories';
import { listProducts } from '../api/products';
import { Row, Col, Card, Typography, Select, InputNumber, Button, Space, Pagination, Skeleton, Empty } from 'antd';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';

const sortOptions = [
  { value: 'createdAt_desc', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'rating_desc', label: 'По рейтингу' },
];

function useCatalogParams() {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => ({
    page: Number(params.get('page') || 1),
    limit: Number(params.get('limit') || 12),
    sort: params.get('sort') || 'createdAt_desc',
    category: params.get('category') || '',
    priceMin: params.get('priceMin') ? Number(params.get('priceMin')) : undefined,
    priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : undefined,
  }), [params]);

  const update = (partial) => {
    const next = new URLSearchParams(params.toString());
    Object.keys(partial).forEach((k) => {
      const v = partial[k];
      if (v === undefined || v === null || v === '') next.delete(k);
      else next.set(k, String(v));
    });
    if (partial.page) {
      next.set('page', String(partial.page));
    }
    setParams(next, { replace: false });
  };

  return [state, update];
}

export default function Catalog() {
  const [state, update] = useCatalogParams();
  const [min, setMin] = useState(state.priceMin);
  const [max, setMax] = useState(state.priceMax);

  useEffect(() => { setMin(state.priceMin); setMax(state.priceMax); }, [state.priceMin, state.priceMax]);

  const { data: categories } = useQuery({
    queryKey: ['categories', { page: 1, limit: 100 }],
    queryFn: () => listCategories({ page: 1, limit: 100 }),
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', state],
    queryFn: () => listProducts({
      page: state.page,
      limit: state.limit,
      sort: state.sort,
      category: state.category || undefined,
      priceMin: state.priceMin,
      priceMax: state.priceMax,
      isActive: true,
    }),
    keepPreviousData: true,
  });

  const applyPrice = () => {
    update({ priceMin: min, priceMax: max, page: 1 });
    refetch();
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Typography.Text>Категория</Typography.Text>
            <Select
              value={state.category || ''}
              onChange={(v) => update({ category: v || '', page: 1 })}
              allowClear
              placeholder="Выберите категорию"
              options={(categories?.items || []).map((c) => ({ value: c._id, label: c.name }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Typography.Text>Сортировка</Typography.Text>
            <Select
              value={state.sort}
              onChange={(v) => update({ sort: v, page: 1 })}
              options={sortOptions}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Typography.Text>Цена</Typography.Text>
            <Space>
              <InputNumber placeholder="мин" value={min} min={0} onChange={setMin} />
              <InputNumber placeholder="макс" value={max} min={0} onChange={setMax} />
              <Button onClick={applyPrice}>OK</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: state.limit }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : error ? (
        <Card type="inner" title="Ошибка">Не удалось загрузить каталог</Card>
      ) : (data?.items || []).length === 0 ? (
        <Empty description="Товары не найдены" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {(data?.items || []).map((p) => (
              <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={data?.page || 1}
              pageSize={data?.limit || state.limit}
              total={data?.total || 0}
              onChange={(page, pageSize) => update({ page, limit: pageSize })}
              showSizeChanger
            />
          </div>
        </>
      )}
    </div>
  );
}
