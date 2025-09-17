import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Seller from './pages/Seller';
import Search from './pages/Search';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'product/:idOrSlug', element: <Product /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'account', element: <Account /> },
      { path: 'seller/:id', element: <Seller /> },
      { path: 'search', element: <Search /> },
      { path: 'auth/login', element: <Login /> },
      { path: 'auth/register', element: <Register /> },
    ],
  },
]);

export default router;
