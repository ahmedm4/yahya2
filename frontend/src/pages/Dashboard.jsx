import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory,
  SwapHoriz,
  TrendingUp,
} from '@mui/icons-material';

import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              backgroundColor: `${color}.light`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError('فشل تحميل بيانات لوحة التحكم');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const isManager = user?.role === 'manager';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        لوحة التحكم
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        ملخص عام لعمليات اليوم
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="طلبات اليوم"
            value={stats?.stats?.total_orders_today || 0}
            icon={<ShoppingCart sx={{ fontSize: 32 }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="التحويلات المعلقة"
            value={stats?.stats?.pending_transfers || 0}
            icon={<SwapHoriz sx={{ fontSize: 32 }} />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="العجائن المخططة"
            value={stats?.stats?.total_batches_planned || 0}
            icon={<Inventory sx={{ fontSize: 32 }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المنتجات المطلوبة"
            value={stats?.stats?.products_ordered || 0}
            icon={<TrendingUp sx={{ fontSize: 32 }} />}
            color="info"
          />
        </Grid>

        {/* Production Summary */}
        {isManager && stats?.production_summary?.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  ملخص الإنتاج اليومي
                </Typography>

                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>المنتج</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>الطلب الكلي</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>العجائن المطلوبة</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>الإنتاج الفعلي</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>الفائض</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.production_summary.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{item.product_name}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.total_pieces_requested}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.batches_needed}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{item.pieces_to_produce}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#4caf50' }}>{item.surplus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Pending Transfers */}
        {stats?.pending_transfers?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  التحويلات المعلقة
                </Typography>

                {stats.pending_transfers.map((transfer) => (
                  <Paper key={transfer.id} sx={{ p: 2, mb: 1, bgcolor: 'warning.light' }}>
                    <Typography variant="body2">
                      من: {transfer.from_branch} → إلى: {transfer.to_branch}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transfer.product_name} - {transfer.pieces} حبة
                    </Typography>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Dashboard;
