import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Receipt, CheckCircle } from '@mui/icons-material';
import { invoicesApi } from '../../services/invoicesApi';
import type { InvoiceResponse } from '../../types';

interface GenerateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onInvoicesGenerated: (invoices: InvoiceResponse[]) => void;
  userId?: number;
}

const GenerateInvoiceDialog: React.FC<GenerateInvoiceDialogProps> = ({
  open,
  onClose,
  onInvoicesGenerated,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    invoices?: InvoiceResponse[];
  } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      let generatedInvoices: InvoiceResponse[];
      
      if (userId) {
        generatedInvoices = await invoicesApi.generateInvoicesForUser(userId);
      } else {
        generatedInvoices = await invoicesApi.generateAllInvoices();
      }
      
      setResult({
        success: true,
        message: `Successfully generated ${generatedInvoices.length} invoice(s)`,
        invoices: generatedInvoices,
      });
      
      if (generatedInvoices.length > 0) {
        onInvoicesGenerated(generatedInvoices);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to generate invoices',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          Generate Invoices
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          {userId 
            ? 'Generate invoices for all verified meter readings of this user that don\'t have invoices yet.'
            : 'Generate invoices for all verified meter readings that don\'t have invoices yet.'
          }
        </Typography>

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            icon={result.success ? <CheckCircle /> : undefined}
          >
            {result.message}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button 
            onClick={handleGenerate} 
            variant="contained" 
            disabled={loading}
          >
            Generate Invoices
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenerateInvoiceDialog;