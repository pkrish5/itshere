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
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

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
}

const SenderView = () => {
  const [delivery, setDelivery] = useState<Delivery>({
    id: '1',
    status: 'pending',
    pickupAddress: '123 Home St, San Francisco',
    dropoffAddress: '456 College Ave, Berkeley',
    instructions: 'Food is in a cooler on the porch',
    estimatedTime: '30 minutes',
    driverLocation: { lat: 37.7749, lng: -122.4194 }
  });

  const [newInstructions, setNewInstructions] = useState('');

  const handleAddInstructions = () => {
    setDelivery(prev => ({
      ...prev,
      instructions: prev.instructions + '\n' + newInstructions
    }));
    setNewInstructions('');
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
                    <Typography>{delivery.dropoffAddress}</Typography>
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
                Add Instructions
              </Typography>
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