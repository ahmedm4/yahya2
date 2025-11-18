import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Contexts and services
import { useAuthStore } from './stores/authStore';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/orders/Orders';
import OrderForm from './pages/orders/OrderForm';
import ProductionSummary from './pages/orders/ProductionSummary';
import Inventory from './pages/inventory/Inventory';
import InventoryForm from './pages/inventory/InventoryForm';
import Transfers from './pages/transfers/Transfers';
import TransferForm from './pages/transfers/TransferForm';
import Branches from './pages/admin/Branches';
import Products from './pages/admin/Products';
import Meals from './pages/admin/Meals';
import Users from './pages/admin/Users';
import Reports from './pages/Reports';

// Protected Route component
function ProtectedRoute({ children, requireManager = false }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireManager && user?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Orders */}
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="orders/:id/edit" element={<OrderForm />} />
          <Route path="orders/production-summary" element={<ProductionSummary />} />

          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/record" element={<InventoryForm />} />

          {/* Transfers */}
          <Route path="transfers" element={<Transfers />} />
          <Route path="transfers/new" element={<TransferForm />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Admin routes (Manager only) */}
          <Route
            path="branches"
            element={
              <ProtectedRoute requireManager>
                <Branches />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute requireManager>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="meals"
            element={
              <ProtectedRoute requireManager>
                <Meals />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requireManager>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
