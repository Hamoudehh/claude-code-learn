import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { IS_STATIC } from './lib/data';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // רענון אוטומטי כל 60 שניות, ללא צורך ברענון הדפדפן
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  },
});

// GitHub Pages לא יודע להגיש נתיבים של אפליקציית SPA, ולכן שם משתמשים בניתוב מבוסס #
const Router = IS_STATIC ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
