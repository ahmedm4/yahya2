import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

import api from '../../services/api';

function ProductionSummary() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductionSummary();
  }, []);

  const fetchProductionSummary = async (date = selectedDate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/production-summary/${date}`);
      setSummary(response.data.data.summary);
      setTotals(response.data.data.totals);
    } catch (err) {
      setError('فشل تحميل ملخص الإنتاج');
      console.error('Error fetching production summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleCalculate = () => {
    fetchProductionSummary(selectedDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info('جاري تطوير ميزة التصدير');
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box className="no-print-container">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            ملخص الإنتاج اليومي
          </Typography>
          <Typography variant="body2" color="text.secondary">
            حساب العجائن المطلوبة بناءً على الطلبات
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }} className="no-print">
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!summary || summary.length === 0}
          >
            طباعة
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={!summary || summary.length === 0}
          >
            تصدير
          </Button>
        </Box>
      </Box>

      {/* Date Selection */}
      <Card sx={{ mb: 3 }} className="no-print">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                fullWidth
                label="تاريخ الإنتاج"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'حساب الإنتاج'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Totals Summary */}
      {!loading && totals && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="caption" display="block">
                عدد المنتجات
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totals.total_products}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="caption" display="block">
                إجمالي الحبات المطلوبة
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totals.total_pieces_requested?.toLocaleString('ar-SA')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="caption" display="block">
                إجمالي العجائن المطلوبة
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totals.total_batches_needed}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="caption" display="block">
                إجمالي الفائض
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totals.total_surplus?.toLocaleString('ar-SA')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Production Table */}
      {!loading && summary && summary.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              تفاصيل الإنتاج - {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: ar })}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 600 }}>المنتج</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>نوع العجنة</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      حبات/عجنة
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      المطلوب
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'primary.light' }}>
                      العجائن المطلوبة
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      الإنتاج الفعلي
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      الفائض
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      الكفاءة
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.map((item, index) => {
                    const efficiency = ((parseInt(item.total_pieces_requested) / parseInt(item.pieces_to_produce)) * 100).toFixed(1);
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.product_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.meal_name}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.pieces_per_batch}
                            size="small"
                            color="default"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {parseInt(item.total_pieces_requested).toLocaleString('ar-SA')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ bgcolor: 'primary.light' }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: 'primary.dark' }}
                          >
                            {item.batches_needed}
                          </Typography>
                          <Typography variant="caption">عجنة</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {parseInt(item.pieces_to_produce).toLocaleString('ar-SA')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`+${parseInt(item.surplus).toLocaleString('ar-SA')}`}
                            size="small"
                            color={parseInt(item.surplus) > 100 ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${efficiency}%`}
                            size="small"
                            color={efficiency >= 90 ? 'success' : efficiency >= 70 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && summary && summary.length === 0 && (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              لا توجد طلبات مؤكدة لهذا التاريخ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              اختر تاريخ آخر أو قم بتأكيد الطلبات أولاً
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Calculation Formula Info */}
      {!loading && summary && summary.length > 0 && (
        <Card sx={{ mt: 3, bgcolor: 'info.light' }} className="no-print">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📐 معادلة الحساب:
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>العجائن المطلوبة</strong> = ceil(إجمالي الطلب ÷ حبات في العجنة)
              <br />
              • <strong>الإنتاج الفعلي</strong> = العجائن المطلوبة × حبات في العجنة
              <br />
              • <strong>الفائض</strong> = الإنتاج الفعلي - إجمالي الطلب
              <br />
              • <strong>الكفاءة</strong> = (الطلب الفعلي ÷ الإنتاج الفعلي) × 100%
            </Typography>
          </CardContent>
        </Card>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .no-print-container .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}

export default ProductionSummary;
