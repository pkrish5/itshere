import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          HomeFood Delivery
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/sender"
            startIcon={<RestaurantIcon />}
          >
            Send Food
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/driver"
            startIcon={<LocalShippingIcon />}
          >
            Driver
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/receiver"
            startIcon={<PersonIcon />}
          >
            Receive Food
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 