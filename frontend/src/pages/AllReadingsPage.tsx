import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { meterReadingsApi } from '../services/meterReadingsApi';
import ReadingList from '../components/MeterReadings/ReadingList';
import type { MeterReadingResponse, MeterType } from '../types';

const AllReadingsPage: React.FC = () => {
  const [readings, setReadings] = useState<MeterReadingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meterType, setMeterType] = useState<MeterType | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const { user } = useAuth();

  const loadReadings = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (meterType !== 'all') params.meter_type = meterType;
      if (verifiedFilter !== 'all') params.verified = verifiedFilter === 'verified';

      const response = await meterReadingsApi.getAllReadings(params);
      setReadings(response.readings);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [meterType, verifiedFilter]);

  const handleReadingUpdate = (updatedReading: MeterReadingResponse) => {
    setReadings(prev => prev.map(reading => 
      reading.id === updatedReading.id ? updatedReading : reading
    ));
  };

  const handleReadingDelete = (readingId: number) => {
    setReadings(prev => prev.filter(reading => reading.id !== readingId));
  };

  // Only managers and admins can access this page
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <Alert severity="error">
        You don't have permission to view this page. Only managers and administrators can access all readings.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        All Meter Readings
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Meter Type</InputLabel>
          <Select
            value={meterType}
            label="Meter Type"
            onChange={(e) => setMeterType(e.target.value as MeterType | 'all')}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="water">Water</MenuItem>
            <MenuItem value="electricity">Electricity</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={verifiedFilter}
            label="Status"
            onChange={(e) => setVerifiedFilter(e.target.value as 'all' | 'verified' | 'pending')}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ReadingList
        readings={readings}
        loading={loading}
        error={error}
        onReadingUpdate={handleReadingUpdate}
        onReadingDelete={handleReadingDelete}
      />
    </Box>
  );
};

export default AllReadingsPage;