import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import {
  AppBar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import AppTheme from './theme/AppTheme';
import MenuIcon from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import Home from './components/home/Home';
import Auth from './components/auth/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';


interface ListItemLinkProps {
  icon?: React.ReactElement<unknown>;
  primary: string;
  to: string;
  selected?: boolean;
  onClick?: () => void;
}

const menus  = [
  {
    title: 'Home',
    element: <Home />,
    path: '/',
  },
  // {
  //   title: 'Pengaduan',
  //   element: <ListTransactions />,
  //   path: '/transactions',
  // }
];

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to, selected, onClick } = props;
  return (
    <ListItemButton component={Link} to={to} selected={selected} onClick={onClick}>
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItemButton>
  );
}

function AuthenticatedApp() {
  const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);
  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('');
  const { user, signOut } = useAuth();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <Router>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={() => signOut()}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {menus.map((menu) => (
              <ListItem key={menu.title} disablePadding>
                <ListItemLink
                  to={menu.path}
                  primary={menu.title}
                  selected={selectedMenu === menu.title}
                  onClick={() => setSelectedMenu(menu.title)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Offset />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppTheme>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </AppTheme>
    );
  }

  if (!user) {
    return (
      <AppTheme>
        <Auth />
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <AuthenticatedApp />
    </AppTheme>
  );
};

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
