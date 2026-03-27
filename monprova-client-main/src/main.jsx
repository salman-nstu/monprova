import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  RouterProvider,
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient();

import { Helmet, HelmetProvider } from 'react-helmet-async';
import { router } from './Routes/Routes.jsx';
import AuthProvider from './providers/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </QueryClientProvider>

    </AuthProvider>
  </StrictMode>,
)
