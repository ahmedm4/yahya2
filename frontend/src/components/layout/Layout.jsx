import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  SwapHoriz as TransfersIcon,
  Assessment as ReportsIcon,
  Store as BranchesIcon,
  Category as ProductsIcon,
  Cake as MealsIcon,
  People as UsersIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';

import { useAuthStore } from '../../stores/authStore';

const drawerWidth = 280;

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const isManager = user?.role === 'manager';

  const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/' },
    { text: 'الطلبات', icon: <OrdersIcon />, path: '/orders' },
    { text: 'المخزون', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'التحويلات', icon: <TransfersIcon />, path: '/transfers' },
    { text: 'التقارير', icon: <ReportsIcon />, path: '/reports' },
  ];

  const adminMenuItems = [
    { text: 'الفروع', icon: <BranchesIcon />, path: '/branches' },
    { text: 'المنتجات', icon: <ProductsIcon />, path: '/products' },
    { text: 'العجائن', icon: <MealsIcon />, path: '/meals' },
    { text: 'المستخدمين', icon: <UsersIcon />, path: '/users' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          🍞 نظام إدارة المخابز
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {isManager && (
        <>
          <Divider />
          <List>
            <ListItem>
              <ListItemText
                primary="إعدادات النظام"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              />
            </ListItem>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            مرحباً، {user?.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.branch_name || 'مدير النظام'}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenuClick}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>الملف الشخصي</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>تسجيل الخروج</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
