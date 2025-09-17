import React from 'react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';

function Home() {
  const featured = [
    { title: 'Новинки', to: '/catalog?sort=createdAt_desc' },
    { title: 'Скидки', to: '/catalog?sort=price_asc' },
    { title: 'Популярное', to: '/catalog?sort=rating_desc' },
  ];

  return (
    <div>
      <Card
        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #e6f4ff 0%, #fff 100%)' }}
        bodyStyle={{ padding: 32 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          Добро пожаловать в Easyappz
        </Typography.Title>
        <Typography.Paragraph style={{ fontSize: 16, color: '#555' }}>
          Исследуйте каталог, ищите товары, добавляйте в корзину и оформляйте заказы.
        </Typography.Paragraph>
        <Link to="/catalog">
          <Button type="primary" size="large">Перейти в каталог</Button>
        </Link>
      </Card>

      <Typography.Title level={3} style={{ marginBottom: 16 }}>Подборки</Typography.Title>
      <Row gutter={[16, 16]}>
        {featured.map((f) => (
          <Col xs={24} sm={12} md={8} key={f.title}>
            <Link to={f.to}>
              <Card hoverable>
                <Typography.Title level={4} style={{ margin: 0 }}>{f.title}</Typography.Title>
                <Typography.Paragraph style={{ marginTop: 8, color: '#666' }}>Откройте подходящие товары</Typography.Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Home;
