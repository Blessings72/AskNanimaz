import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import InvoiceCard from './InvoiceCard';
import type { InvoiceResponse } from '../../types';

interface InvoiceListProps {
  invoices: InvoiceResponse[];
  loading?: boolean;
  error?: string;
  onInvoiceUpdate?: (invoice: InvoiceResponse) => void;
  onInvoiceDelete?: (invoiceId: number) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  loading = false,
  error,
  onInvoiceUpdate,
  onInvoiceDelete,
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

  if (invoices.length === 0) {
    return (
      <Alert severity="info">
        No invoices found.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Invoices ({invoices.length})
      </Typography>
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.id}
          invoice={invoice}
          onUpdate={onInvoiceUpdate}
          onDelete={onInvoiceDelete}
        />
      ))}
    </Box>
  );
};

export default InvoiceList;