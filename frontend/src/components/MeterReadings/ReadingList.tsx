import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import ReadingCard from './ReadingCard';
import type { MeterReadingResponse } from '../../types';

interface ReadingListProps {
  readings: MeterReadingResponse[];
  loading?: boolean;
  error?: string;
  onReadingUpdate?: (reading: MeterReadingResponse) => void;
  onReadingDelete?: (readingId: number) => void;
}

const ReadingList: React.FC<ReadingListProps> = ({
  readings,
  loading = false,
  error,
  onReadingUpdate,
  onReadingDelete,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (readings.length === 0) {
    return (
      <Alert severity="info">
        No meter readings found.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Meter Readings ({readings.length})
      </Typography>
      {readings.map((reading) => (
        <ReadingCard
          key={reading.id}
          reading={reading}
          onUpdate={onReadingUpdate}
          onDelete={onReadingDelete}
        />
      ))}
    </Box>
  );
};

export default ReadingList;