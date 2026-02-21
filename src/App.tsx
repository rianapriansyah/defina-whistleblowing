import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, styled, Toolbar } from '@mui/material';
import AppTheme from './theme/AppTheme';
import MenuIcon from '@mui/icons-material/Menu';
import Home from './components/home/Home';


interface ListItemLinkProps {
  icon?: React.ReactElement<unknown>;
  primary: string;
  to: string;
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

const App: React.FC = () => {
  const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);
  const [open, setOpen] = useState(false);
  const [selectedMenu, setSelectedMenu]=useState("");
  
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  function ListItemLink(props: ListItemLinkProps) {
    const { icon, primary, to } = props;
  
    return (
      <ListItemButton component={Link} to={to} onClick={()=>setSelectedMenu(primary)} selected={selectedMenu===primary}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItemButton>
    );
  }

  return (
    <AppTheme>
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
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {menus.map((menu) => (
              <ListItem key={menu.title} disablePadding>
                <ListItemLink to={menu.path} primary={menu.title} />
              </ListItem>
            ))}
            
          </List>
        </Box>
      </Drawer>
      <Offset />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/cars" element={<CarList />} />
          <Route path="/transactions" element={<ListTransactions />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/car-details" element={<CarDetails />} />
          <Route path="/manual-input" element={<ManualInputForm />} /> */}
        </Routes>
      </Router>
    </AppTheme>
  );
};

export default App;
