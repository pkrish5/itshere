import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';

interface Delivery {
  id: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered';
  pickupAddress: string;
  dropoffLocation: string;
  instructions: string;
  estimatedTime: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  leaveOutTime: string;
}

const commonPickupLocations = [
  { id: '1', name: 'Main Campus Center', address: '123 Campus Center Dr' },
  { id: '2', name: 'North Campus Hub', address: '456 North Campus Way' },
  { id: '3', name: 'Student Union', address: '789 Union Ave' },
  { id: '4', name: 'Library Plaza', address: '321 Library Rd' },
];

const SenderView = () => {
  const [delivery, setDelivery] = useState<Delivery>({
    id: '1',
    status: 'pending',
    pickupAddress: '123 Home St, San Francisco',
    dropoffLocation: 'Main Campus Center',
    instructions: 'Food is in a cooler on the porch',
    estimatedTime: '30 minutes',
    driverLocation: { lat: 37.7749, lng: -122.4194 },
    leaveOutTime: '12:00 PM'
  });

  const [newInstructions, setNewInstructions] = useState('');
  const [selectedDropoff, setSelectedDropoff] = useState('');

  const handleAddInstructions = () => {
    setDelivery(prev => ({
      ...prev,
      instructions: prev.instructions + '\n' + newInstructions
    }));
    setNewInstructions('');
  };

  const handleDropoffChange = (event: any) => {
    const location = commonPickupLocations.find(loc => loc.id === event.target.value);
    if (location) {
      setSelectedDropoff(location.id);
      setDelivery(prev => ({
        ...prev,
        dropoffLocation: location.name
      }));
    }
  };

  const steps = ['Order Placed', 'Driver Assigned', 'Food Picked Up', 'In Transit', 'Delivered'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Send Food to Your Student
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Status
              </Typography>
              <Stepper activeStep={delivery.status === 'pending' ? 0 : 
                                  delivery.status === 'picked-up' ? 2 : 
                                  delivery.status === 'in-transit' ? 3 : 4}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Pickup Location</Typography>
                    </Box>
                    <Typography>{delivery.pickupAddress}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">Dropoff Location</Typography>
                    </Box>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <InputLabel>Select Dropoff Location</InputLabel>
                      <Select
                        value={selectedDropoff}
                        onChange={handleDropoffChange}
                        label="Select Dropoff Location"
                      >
                        {commonPickupLocations.map((location) => (
                          <MenuItem key={location.id} value={location.id}>
                            {location.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Choose a common pickup location for your student
                      </FormHelperText>
                    </FormControl>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Instructions
              </Typography>
              <TextField
                fullWidth
                type="time"
                label="Leave Food Out By"
                value={delivery.leaveOutTime}
                onChange={(e) => setDelivery(prev => ({ ...prev, leaveOutTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Add any special instructions for the driver..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddInstructions}
                fullWidth
              >
                Add Instructions
              </Button>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Instructions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {delivery.instructions}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  Estimated Delivery Time: {delivery.estimatedTime}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SenderView; 