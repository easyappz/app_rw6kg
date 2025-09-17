import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSeller, listSellerProducts } from '../api/sellers';
import { Card, Row, Col, Typography, Skeleton } from 'antd';
import ProductCard from '../components/ProductCard';

export default function Seller() {
  const { id } = useParams();

  const { data: sellerData, isLoading: loadingSeller } = useQuery({ queryKey: ['seller', id], queryFn: () => getSeller(id) });
  const { data: productsData, isLoading: loadingProducts } = useQuery({ queryKey: ['sellerProducts', id], queryFn: () => listSellerProducts(id, { page: 1, limit: 24 }) });

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        {loadingSeller ? (
          <Skeleton active />
        ) : (
          <>
            <Typography.Title level={3}>{sellerData?.shopName || sellerData?.item?.shopName || 'Продавец'}</Typography.Title>
            <Typography.Text type="secondary">{sellerData?.description || sellerData?.item?.description || ''}</Typography.Text>
          </>
        )}
      </Card>
      {loadingProducts ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}><Card><Skeleton active /></Card></Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {(productsData?.items || []).map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
