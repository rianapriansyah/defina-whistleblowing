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
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const menuItems = [
  { label: 'Kirim Pengaduan', path: '/', icon: <Send /> },
  { label: 'Lacak Pengaduan', path: '/lacak-pengaduan', icon: <Search /> },
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
];

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();
  const { user, signOut } = useAuth();

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
            {menuItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
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
            Defina Whistleblowing
          </Typography>
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                {user.email}
              </Typography>
              <Button color="inherit" startIcon={<Logout />} onClick={() => signOut()}>
                Keluar
              </Button>
            </>
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
