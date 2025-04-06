import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsIcon from '@mui/icons-material/Directions';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const center = {
  lat: 37.8719,
  lng: -122.2585
};

interface Delivery {
  id: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered';
  pickupAddress: string;
  dropoffAddress: string;
  instructions: string;
  estimatedTime: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  foodItems: string[];
}

const ReceiverView = () => {
  const [delivery, setDelivery] = useState<Delivery>({
    id: '1',
    status: 'in-transit',
    pickupAddress: '123 Home St, San Francisco',
    dropoffAddress: '456 College Ave, Berkeley',
    instructions: 'Food is in a cooler on the porch',
    estimatedTime: '15 minutes',
    driverLocation: { lat: 37.7749, lng: -122.4194 },
    foodItems: ['Mom\'s Special Biryani', 'Chicken Curry', 'Naan Bread', 'Gulab Jamun']
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'picked-up':
        return 'primary';
      case 'in-transit':
        return 'warning';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Food is on the Way!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Delivery Status
                </Typography>
                <Chip
                  label={delivery.status.toUpperCase()}
                  color={getStatusColor(delivery.status)}
                />
              </Box>
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={12}
                >
                  {delivery.driverLocation && (
                    <Marker
                      position={delivery.driverLocation}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                      }}
                    />
                  )}
                  <Marker
                    position={center}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Food Items
              </Typography>
              <List>
                {delivery.foodItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <RestaurantIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                    {index < delivery.foodItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pickup Information
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Pickup Location</Typography>
                </Box>
                <Typography>{delivery.dropoffAddress}</Typography>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  Estimated Arrival: {delivery.estimatedTime}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<DirectionsIcon />}
                fullWidth
                href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.dropoffAddress}`}
                target="_blank"
              >
                Get Directions
              </Button>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Special Instructions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {delivery.instructions}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReceiverView; 