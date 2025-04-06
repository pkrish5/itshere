import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

interface DeliveryStop {
  id: string;
  address: string;
  type: 'pickup' | 'dropoff';
  instructions?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const DriverView = () => {
  const [stops, setStops] = useState<DeliveryStop[]>([
    {
      id: '1',
      address: '123 Home St, San Francisco',
      type: 'pickup',
      instructions: 'Food is in a cooler on the porch',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    {
      id: '2',
      address: '456 College Ave, Berkeley',
      type: 'dropoff',
      coordinates: { lat: 37.8719, lng: -122.2585 }
    }
  ]);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the stops from Firebase
    // and calculate the optimal route
    const calculateRoute = async () => {
      if (window.google) {
        const directionsService = new google.maps.DirectionsService();
        const waypoints = stops.slice(1, -1).map(stop => ({
          location: stop.coordinates,
          stopover: true
        }));

        const result = await directionsService.route({
          origin: stops[0].coordinates,
          destination: stops[stops.length - 1].coordinates,
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        });

        setDirections(result);
      }
    };

    calculateRoute();
  }, [stops]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 2 }}>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
            >
              {directions && <DirectionsRenderer directions={directions} />}
              {stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={stop.coordinates}
                  icon={{
                    url: stop.type === 'pickup' ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Stops
              </Typography>
              <List>
                {stops.map((stop, index) => (
                  <React.Fragment key={stop.id}>
                    <ListItem>
                      <ListItemIcon>
                        {stop.type === 'pickup' ? <LocationOnIcon color="error" /> : <SchoolIcon color="success" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={stop.address}
                        secondary={stop.instructions}
                      />
                    </ListItem>
                    {index < stops.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default DriverView; 