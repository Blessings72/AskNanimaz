import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { AttachMoney, CreditCard, AccountBalance } from '@mui/icons-material';
import type { InvoiceResponse } from '../../types';

interface PaymentDialogProps {
  invoice: InvoiceResponse;
  open: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedInvoice: InvoiceResponse) => void;
  loading?: boolean;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  invoice,
  open,
  onClose,
  onPaymentSuccess,
  loading = false,
}) => {
  const handlePayment = async (method: string) => {
    try {
      // In a real application, you would integrate with a payment processor here
      // For now, we'll just mark the invoice as paid via our API
      const invoicesApi = await import('../../services/invoicesApi');
      const updatedInvoice = await invoicesApi.invoicesApi.markInvoicePaid(invoice.id);
      onPaymentSuccess(updatedInvoice);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Pay Invoice #{invoice.invoice_number}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Invoice Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Amount: <strong>${invoice.amount.toFixed(2)}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Due Date: {new Date(invoice.due_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Consumption: {invoice.consumption} units
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Rate: ${invoice.rate.toFixed(2)} per unit
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          This is a demo payment interface. In a real application, you would integrate with a payment processor like Stripe or PayPal.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Select Payment Method
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CreditCard />}
            onClick={() => handlePayment('card')}
            disabled={loading}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1.5 }}
          >
            Credit/Debit Card
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AccountBalance />}
            onClick={() => handlePayment('bank')}
            disabled={loading}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1.5 }}
          >
            Bank Transfer
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<AttachMoney />}
            onClick={() => handlePayment('cash')}
            disabled={loading}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1.5 }}
          >
            Cash Payment
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;