import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        toast.error(data.message_ar || 'انتهت صلاحية الجلسة');
      }
      // Forbidden
      else if (status === 403) {
        toast.error(data.message_ar || 'ليس لديك صلاحية للوصول');
      }
      // Not Found
      else if (status === 404) {
        toast.error(data.message_ar || 'العنصر غير موجود');
      }
      // Server Error
      else if (status >= 500) {
        toast.error(data.message_ar || 'خطأ في الخادم');
      }
      // Other errors
      else {
        toast.error(data.message_ar || 'حدث خطأ ما');
      }
    } else if (error.request) {
      toast.error('خطأ في الاتصال بالخادم');
    } else {
      toast.error('حدث خطأ غير متوقع');
    }

    return Promise.reject(error);
  }
);

export default api;
