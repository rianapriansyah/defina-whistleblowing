import React, { useState } from 'react';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  styled,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Send from '@mui/icons-material/Send';
import Search from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactCheck from '@mui/icons-material/FactCheck';
import PersonAddAlt from '@mui/icons-material/PersonAddAlt';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

type MenuItemConfig = {
  label: string;
  path: string;
  icon: React.ReactNode;
  requiresAuth: boolean;
  requiresAdmin?: boolean;
};

const menuItems: MenuItemConfig[] = [
  { label: 'Kirim Pengaduan', path: '/', icon: <Send />, requiresAuth: false },
  { label: 'Lacak Pengaduan', path: '/lacak-pengaduan', icon: <Search />, requiresAuth: false },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, requiresAuth: true },
  { label: 'Investigasi & Analisis', path: '/investigasi-analisis', icon: <FactCheck />, requiresAuth: true },
  {
    label: 'Stakeholder',
    path: '/admin/undang-stakeholder',
    icon: <PersonAddAlt />,
    requiresAuth: true,
    requiresAdmin: true,
  },
];

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, pt: 1 }} role="presentation">
      <List disablePadding>
        <ListItemButton onClick={toggleMenu}>
          <ListItemText primary="Menu" primaryTypographyProps={{ fontWeight: 600 }} />
          {menuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={menuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menuItems
              .filter((item) => {
                if (item.requiresAdmin && !isAdmin) return false;
                if (item.requiresAuth && !user) return false;
                return true;
              })
              .map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                sx={{ pl: 3 }}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle menu"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            RSIA Defina WBS
          </Typography>
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                {user.email}
              </Typography>
              <Button color="inherit" startIcon={<Logout />} onClick={() => signOut()}>
                Keluar
              </Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login" variant="outlined" sx={{ borderColor: 'inherit', color: 'inherit' }}>
              Stakeholder
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, mt: 7 },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        <Offset />
        <Outlet />
      </Box>
    </Box>
  );
}
