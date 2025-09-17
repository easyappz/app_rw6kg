import React from 'react';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div style={{ padding: 24 }}>
        <h2>Приложение инициализировано</h2>
        <p>Навигация работает через RouterProvider. Откройте любую страницу из шапки.</p>
      </div>
    </ErrorBoundary>
  );
}

export default App;
