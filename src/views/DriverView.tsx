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
  Button,
  Chip,
  Grid,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  leaveOutTime?: string;
  status: 'pending' | 'completed';
  studentName?: string;
}

const DriverView = () => {
  const [stops, setStops] = useState<DeliveryStop[]>([
    {
      id: '1',
      address: '123 Home St, San Francisco',
      type: 'pickup',
      instructions: 'Food is in a cooler on the porch',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      leaveOutTime: '12:00 PM',
      status: 'pending'
    },
    {
      id: '2',
      address: 'Main Campus Center, 123 Campus Center Dr',
      type: 'dropoff',
      coordinates: { lat: 37.8719, lng: -122.2585 },
      status: 'pending',
      studentName: 'John Doe'
    },
    {
      id: '3',
      address: '456 Home Ave, Oakland',
      type: 'pickup',
      instructions: 'Food is in a thermal bag by the door',
      coordinates: { lat: 37.8044, lng: -122.2712 },
      leaveOutTime: '12:30 PM',
      status: 'pending'
    },
    {
      id: '4',
      address: 'Student Union, 789 Union Ave',
      type: 'dropoff',
      coordinates: { lat: 37.8715, lng: -122.2600 },
      status: 'pending',
      studentName: 'Jane Smith'
    }
  ]);

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentStop, setCurrentStop] = useState<number>(0);

  useEffect(() => {
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

  const handleStopComplete = (stopId: string) => {
    setStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, status: 'completed' } : stop
    ));
    setCurrentStop(prev => prev + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
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
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {stop.type === 'pickup' ? 'Pickup' : 'Dropoff'}
                            {stop.status === 'completed' && (
                              <CheckCircleIcon color="success" fontSize="small" />
                            )}
                            {index === currentStop && (
                              <Chip
                                label="Current Stop"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">{stop.address}</Typography>
                            {stop.type === 'pickup' && stop.leaveOutTime && (
                              <Typography variant="body2" color="text.secondary">
                                Leave out by: {stop.leaveOutTime}
                              </Typography>
                            )}
                            {stop.type === 'dropoff' && stop.studentName && (
                              <Typography variant="body2" color="text.secondary">
                                Student: {stop.studentName}
                              </Typography>
                            )}
                            {stop.instructions && (
                              <Typography variant="body2" color="text.secondary">
                                Instructions: {stop.instructions}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stops.length - 1 && <Divider />}
                    {index === currentStop && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleStopComplete(stop.id)}
                        >
                          Mark {stop.type === 'pickup' ? 'Pickup' : 'Dropoff'} Complete
                        </Button>
                      </Box>
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverView; 