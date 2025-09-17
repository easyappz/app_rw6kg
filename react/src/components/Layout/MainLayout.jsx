import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Flex, Typography } from 'antd';
import { ShoppingCartOutlined, AppstoreOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import SearchBox from '../Header/SearchBox';
import { getCart } from '../../api/cart';

const { Header, Content, Footer } = Layout;

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });

  const cartCount = Array.isArray(cartData?.cart?.items) ? cartData.cart.items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0) : 0;

  const items = [
    { key: '/', icon: <HomeOutlined />, label: 'Главная' },
    { key: '/catalog', icon: <AppstoreOutlined />, label: 'Каталог' },
    { key: '/account', icon: <UserOutlined />, label: 'Личный кабинет' },
    {
      key: '/cart',
      icon: (
        <Badge count={cartCount} size="small" offset={[0, 6]}>
          <ShoppingCartOutlined />
        </Badge>
      ),
      label: 'Корзина',
    },
  ];

  const onMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Flex align="center" gap={16} wrap>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/logo192.png" alt="logo" width={28} height={28} style={{ display: 'block' }} />
              <Typography.Title level={4} style={{ margin: 0, color: '#1677ff' }}>Easyappz</Typography.Title>
            </Link>
            <div style={{ flex: 1, minWidth: 240 }}>
              <SearchBox />
            </div>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={items}
              onClick={onMenuClick}
              style={{ borderBottom: 'none', marginLeft: 'auto' }}
            />
          </Flex>
        </div>
      </Header>
      <Content style={{ padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, padding: '0 16px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} Easyappz — маркетплейс на React и Node.js
      </Footer>
    </Layout>
  );
}

export default MainLayout;
