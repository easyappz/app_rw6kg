import React, { useState } from 'react';
import { Input } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

function SearchBox() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('q') || '';
  const [value, setValue] = useState(initial);

  const onSearch = () => {
    const q = value ? value.trim() : '';
    if (q.length === 0) {
      navigate('/search');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Input.Search
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Поиск товаров"
      allowClear
      onSearch={onSearch}
      enterButton
      size="large"
    />
  );
}

export default SearchBox;
