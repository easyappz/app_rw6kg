import React, { useMemo } from 'react';
import { Layout, Menu, Button, Space, Input, Dropdown, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getToken, getStoredUser, clearAuthData } from '../hooks/useAuth';

const { Header, Content, Footer } = Layout;

function useMenuSelectedKeys() {
  const location = useLocation();
  const key = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/catalog')) return 'catalog';
    if (p.startsWith('/cart')) return 'cart';
    if (p.startsWith('/account')) return 'account';
    return 'home';
  }, [location.pathname]);
  return [key];
}

export default function AppLayout() {
  const navigate = useNavigate();
  const [selected] = useMenuSelectedKeys();
  const token = getToken();
  const user = getStoredUser();

  const onSearch = (value) => {
    const v = String(value || '').trim();
    if (!v) return;
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  const menuItems = [
    { key: 'home', label: <Link to="/">Главная</Link> },
    { key: 'catalog', label: <Link to="/catalog">Каталог</Link> },
    { key: 'cart', label: <Link to="/cart">Корзина</Link> },
    { key: 'account', label: token ? <Link to="/account">Личный кабинет</Link> : <Link to="/login">Войти</Link> },
  ];

  const userMenu = {
    items: [
      { key: 'account', label: <Link to="/account">Личный кабинет</Link> },
      { key: 'logout', label: 'Выйти', onClick: () => { clearAuthData(); navigate('/'); } },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
          <Link to="/" style={{ color: '#fff' }}>Easyappz</Link>
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selected}
          items={menuItems}
          style={{ flex: 1 }}
        />
        <Space>
          <Input.Search placeholder="Поиск товаров" allowClear onSearch={onSearch} style={{ width: 300 }} />
          {token ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Button type="primary">{user?.name || 'Аккаунт'}</Button>
            </Dropdown>
          ) : (
            <>
              <Link to="/login"><Button>Вход</Button></Link>
              <Link to="/register"><Button type="primary">Регистрация</Button></Link>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ padding: 24, background: '#f7f8fa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} Easyappz. Все права защищены.</Footer>
    </Layout>
  );
}
