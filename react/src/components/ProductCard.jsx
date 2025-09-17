import React from 'react';
import { Card, Rate, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product }) {
  const image = Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : '';
  return (
    <Link to={`/product/${product?.slug || product?._id}`} style={{ color: 'inherit' }}>
      <Card
        hoverable
        cover={image ? (
          <img alt={product?.title} src={image} style={{ objectFit: 'cover', height: 180 }} />
        ) : null}
      >
        <Typography.Text strong ellipsis>{product?.title}</Typography.Text>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {formatPrice(product?.discountPrice || product?.price)}
          </Typography.Title>
          <Rate disabled allowHalf defaultValue={Number(product?.ratingAvg || 0)} style={{ fontSize: 14 }} />
        </div>
      </Card>
    </Link>
  );
}
