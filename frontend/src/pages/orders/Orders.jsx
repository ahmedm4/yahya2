import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as SummaryIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const statusColors = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'success',
  completed: 'primary',
  cancelled: 'error',
};

const statusLabels = {
  draft: 'مسودة',
  submitted: 'مقدم',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState(null);

  const isManager = user?.role === 'manager';

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.data);
      setError(null);
    } catch (err) {
      setError('فشل تحميل الطلبات');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(order => order.order_date === dateFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('تم حذف الطلب بنجاح');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message_ar || 'فشل حذف الطلب');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            الطلبات اليومية
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة طلبات الفروع اليومية
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SummaryIcon />}
            onClick={() => navigate('/orders/production-summary')}
          >
            ملخص الإنتاج
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/orders/new')}
          >
            طلب جديد
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="الحالة"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">جميع الحالات</MenuItem>
                <MenuItem value="draft">مسودة</MenuItem>
                <MenuItem value="submitted">مقدم</MenuItem>
                <MenuItem value="confirmed">مؤكد</MenuItem>
                <MenuItem value="completed">مكتمل</MenuItem>
                <MenuItem value="cancelled">ملغي</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                fullWidth
                label="التاريخ"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('');
                }}
                sx={{ height: '56px' }}
              >
                إعادة تعيين
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
              {orders.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي الطلبات
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'confirmed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              طلبات مؤكدة
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'submitted').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              قيد المراجعة
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 700 }}>
              {orders.filter(o => o.status === 'draft').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              مسودات
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell>رقم الطلب</TableCell>
                <TableCell>الفرع</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>عدد الأصناف</TableCell>
                <TableCell>إجمالي الحبات</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell align="center">الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      لا توجد طلبات
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.branch_name}</TableCell>
                    <TableCell>
                      {format(new Date(order.order_date), 'dd MMMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>{order.item_count || 0}</TableCell>
                    <TableCell>{order.total_pieces_requested || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        title="عرض"
                      >
                        <ViewIcon />
                      </IconButton>
                      {order.status === 'draft' && (
                        <>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/orders/${order.id}/edit`)}
                            title="تعديل"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(order.id)}
                            title="حذف"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default Orders;
