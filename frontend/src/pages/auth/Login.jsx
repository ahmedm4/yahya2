import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../stores/authStore';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('مرحباً بك في نظام إدارة المخابز');
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h2">🍞</Typography>
          </Box>

          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            نظام إدارة المخابز
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            تسجيل الدخول إلى حسابك
          </Typography>

          <Card sx={{ width: '100%', mt: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="البريد الإلكتروني"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="كلمة المرور"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LockOutlined />}
                >
                  {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    حسابات تجريبية:
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    المدير: admin@bakery.com / password123
                  </Typography>
                  <Typography variant="caption" display="block">
                    مستخدم: narjis@bakery.com / password123
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            © 2024 نظام إدارة المخابز - جميع الحقوق محفوظة
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
