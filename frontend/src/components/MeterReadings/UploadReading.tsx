import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { meterReadingsApi } from '../../services/meterReadingsApi';
import type { MeterType } from '../../types';

const UploadReading: React.FC = () => {
  const [formData, setFormData] = useState({
    meter_type: 'water' as MeterType,
    reading_value: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select an image of the meter');
      return;
    }

    if (!formData.reading_value || parseFloat(formData.reading_value) <= 0) {
      setError('Please enter a valid reading value');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('meter_type', formData.meter_type);
      uploadData.append('reading_value', formData.reading_value);
      uploadData.append('image', selectedFile);

      await meterReadingsApi.uploadReading(uploadData);

      setSuccess('Meter reading uploaded successfully!');
      setFormData({
        meter_type: 'water',
        reading_value: '',
      });
      handleRemoveFile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload meter reading');
    } finally {
      setLoading(false);
    }
  };

  // Only residents can upload readings
  if (user?.role !== 'resident' && user?.role !== 'admin') {
    return (
      <Alert severity="info">
        Only residents can upload meter readings. Please contact a manager if you need to submit a reading.
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Meter Reading
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Meter Type</InputLabel>
          <Select
            name="meter_type"
            value={formData.meter_type}
            label="Meter Type"
            onChange={handleSelectChange}
          >
            <MenuItem value="water">Water Meter</MenuItem>
            <MenuItem value="electricity">Electricity Meter</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Reading Value"
          name="reading_value"
          type="number"
          value={formData.reading_value}
          onChange={handleInputChange}
          margin="normal"
          required
          inputProps={{ step: "0.01", min: "0" }}
          helperText="Enter the current meter reading value"
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="meter-image-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="meter-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ mr: 2 }}
            >
              Select Meter Image
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary">
            Upload a clear photo of your meter (max 10MB)
          </Typography>
        </Box>

        {previewUrl && (
          <Card sx={{ maxWidth: 400, mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={previewUrl}
              alt="Meter preview"
              sx={{ objectFit: 'contain' }}
            />
            <Button
              startIcon={<Delete />}
              onClick={handleRemoveFile}
              color="error"
              sx={{ m: 1 }}
            >
              Remove Image
            </Button>
          </Card>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || !selectedFile}
          sx={{ mt: 2 }}
        >
          {loading ? 'Uploading...' : 'Upload Reading'}
        </Button>
      </form>
    </Paper>
  );
};

export default UploadReading;