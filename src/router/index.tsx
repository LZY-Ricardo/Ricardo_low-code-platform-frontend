/**
 * 路由配置
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Projects from '../pages/Projects';
import Templates from '../pages/Templates';
import Settings from '../pages/Settings';
import LowcodeEditor from '../editor/index';
import PublishedViewer from '../pages/PublishedViewer';
import FormManager from '../pages/FormManager';
import FormDetail from '../pages/FormDetail';
import LogsPage from '../pages/Logs';
import SharedProject from '../pages/SharedProject';
import CreatorMarket from '../pages/CreatorMarket';
import MarketDetail from '../pages/MarketDetail';
import PublishMarketComponent from '../pages/PublishMarketComponent';
import TrashBin from '../pages/TrashBin';
import ProtectedRoute from './ProtectedRoute';
import RouteErrorBoundary from './RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/projects" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/p/:publishUrl',
    element: <PublishedViewer />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/s/:token',
    element: <SharedProject />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute>
        <Projects />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/templates',
    element: (
      <ProtectedRoute>
        <Templates />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/forms',
    element: (
      <ProtectedRoute>
        <FormManager />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/forms/:id',
    element: (
      <ProtectedRoute>
        <FormDetail />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/market',
    element: (
      <ProtectedRoute>
        <CreatorMarket />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/market/:type/:id',
    element: (
      <ProtectedRoute>
        <MarketDetail />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/market/publish/component',
    element: (
      <ProtectedRoute>
        <PublishMarketComponent />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/trash',
    element: (
      <ProtectedRoute>
        <TrashBin />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/logs',
    element: (
      <ProtectedRoute>
        <LogsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/editor/:projectId',
    element: (
      <ProtectedRoute>
        <LowcodeEditor />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/editor',
    element: (
      <ProtectedRoute>
        <LowcodeEditor />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);
