/**
 * 路由配置
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Projects from '../pages/Projects';
import LowcodeEditor from '../editor/index';
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
    path: '/projects',
    element: (
      <ProtectedRoute>
        <Projects />
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
