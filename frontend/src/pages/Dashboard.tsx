import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {user?.full_name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {user?.role}
              </Typography>
              {user?.apartment_number && (
                <Typography variant="body1">
                  <strong>Apartment:</strong> {user?.apartment_number}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.role === 'resident' 
                  ? 'Submit meter readings and view your invoices'
                  : 'Manage meter readings and generate invoices'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;