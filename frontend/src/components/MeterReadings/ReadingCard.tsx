import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  CardMedia,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Verified,
  Warning,
  Delete,
  Visibility,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { meterReadingsApi } from '../../services/meterReadingsApi';
import type { MeterReadingResponse } from '../../types';
import ImagePreview from '../Common/ImagePreview';

interface ReadingCardProps {
  reading: MeterReadingResponse;
  onUpdate?: (reading: MeterReadingResponse) => void;
  onDelete?: (readingId: number) => void;
}

const ReadingCard: React.FC<ReadingCardProps> = ({ reading, onUpdate, onDelete }) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const updatedReading = await meterReadingsApi.verifyReading(reading.id);
      onUpdate?.(updatedReading);
    } catch (error) {
      console.error('Failed to verify reading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await meterReadingsApi.deleteReading(reading.id);
      onDelete?.(reading.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete reading:', error);
    } finally {
      setLoading(false);
    }
  };

  const canVerify = (user?.role === 'manager' || user?.role === 'admin') && !reading.verified;
  const canDelete = user?.role === 'admin' || reading.user_id === user?.id;

  const fullImageUrl = reading.image_url.startsWith('http') 
    ? reading.image_url 
    : `http://localhost:8000${reading.image_url}`;

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" component="h2">
                {reading.meter_type === 'water' ? 'Water Meter' : 'Electricity Meter'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Reading: <strong>{reading.reading_value}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Submitted: {new Date(reading.reading_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                By: {reading.user.full_name} 
                {reading.user.apartment_number && ` (Apartment ${reading.user.apartment_number})`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              {reading.verified ? (
                <Chip
                  icon={<Verified />}
                  label="Verified"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  icon={<Warning />}
                  label="Pending Verification"
                  color="warning"
                  size="small"
                />
              )}

              {reading.verified_by && reading.verified_at && (
                <Typography variant="caption" color="textSecondary">
                  Verified on {new Date(reading.verified_at).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => setImagePreviewOpen(true)}
            >
              View Image
            </Button>

            {canVerify && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={handleVerify}
                disabled={loading}
              >
                Verify
              </Button>
            )}

            {canDelete && (
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <ImagePreview
        imageUrl={fullImageUrl}
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Reading</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this meter reading? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReadingCard;