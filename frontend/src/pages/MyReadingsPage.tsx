import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { meterReadingsApi } from '../services/meterReadingsApi';
import ReadingList from '../components/MeterReadings/ReadingList';
import type { MeterReadingResponse, MeterType } from '../types';

const MyReadingsPage: React.FC = () => {
  const [readings, setReadings] = useState<MeterReadingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meterType, setMeterType] = useState<MeterType | 'all'>('all');

  const loadReadings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = meterType !== 'all' ? { meter_type: meterType } : undefined;
      const response = await meterReadingsApi.getMyReadings(params);
      setReadings(response.readings);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [meterType]);

  const handleReadingUpdate = (updatedReading: MeterReadingResponse) => {
    setReadings(prev => prev.map(reading => 
      reading.id === updatedReading.id ? updatedReading : reading
    ));
  };

  const handleReadingDelete = (readingId: number) => {
    setReadings(prev => prev.filter(reading => reading.id !== readingId));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Meter Readings
      </Typography>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Filter by Type</InputLabel>
        <Select
          value={meterType}
          label="Filter by Type"
          onChange={(e) => setMeterType(e.target.value as MeterType | 'all')}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="water">Water</MenuItem>
          <MenuItem value="electricity">Electricity</MenuItem>
        </Select>
      </FormControl>

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

export default MyReadingsPage;