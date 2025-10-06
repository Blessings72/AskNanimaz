import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Paid,
  Pending,
  Receipt,
  Visibility,
  CreditCard,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import type { InvoiceResponse } from '../../types';
import PaymentDialog from '../Common/PaymentDialog';

interface InvoiceCardProps {
  invoice: InvoiceResponse;
  onUpdate?: (invoice: InvoiceResponse) => void;
  onDelete?: (invoiceId: number) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onUpdate, onDelete }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isOverdue = new Date(invoice.due_date) < new Date() && !invoice.paid;
  const canPay = !invoice.paid && (user?.role === 'resident' || user?.role === 'admin');

  const handlePaymentSuccess = (updatedInvoice: InvoiceResponse) => {
    setPaymentDialogOpen(false);
    onUpdate?.(updatedInvoice);
  };

  const handleViewDetails = () => {
    setDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <Card sx={{ mb: 2, border: isOverdue ? '1px solid #f44336' : 'none' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" component="h2">
                Invoice #{invoice.invoice_number}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {invoice.meter_reading.meter_type === 'water' ? 'Water' : 'Electricity'} Bill
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                {formatCurrency(invoice.amount)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              {invoice.paid ? (
                <Chip
                  icon={<Paid />}
                  label="Paid"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  icon={<Pending />}
                  label={isOverdue ? 'Overdue' : 'Pending'}
                  color={isOverdue ? 'error' : 'warning'}
                  size="small"
                />
              )}

              <Typography variant="caption" color="textSecondary">
                Due: {new Date(invoice.due_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={handleViewDetails}
            >
              View Details
            </Button>

            {canPay && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CreditCard />}
                onClick={() => setPaymentDialogOpen(true)}
                disabled={loading}
              >
                Pay Now
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <PaymentDialog
        invoice={invoice}
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        loading={loading}
      />

      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Invoice Details - #{invoice.invoice_number}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Issue Date</Typography>
              <Typography>{new Date(invoice.issue_date).toLocaleDateString()}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Due Date</Typography>
              <Typography color={isOverdue && !invoice.paid ? 'error' : 'inherit'}>
                {new Date(invoice.due_date).toLocaleDateString()}
                {isOverdue && !invoice.paid && ' (Overdue)'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography>
                {invoice.paid ? 'Paid' : 'Pending'}
                {invoice.paid_at && ` on ${new Date(invoice.paid_at).toLocaleDateString()}`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Meter Type</Typography>
              <Typography>
                {invoice.meter_reading.meter_type === 'water' ? 'Water' : 'Electricity'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Billing Details</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Consumption:</Typography>
              <Typography>{invoice.consumption} units</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Rate:</Typography>
              <Typography>{formatCurrency(invoice.rate)} per unit</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, borderTop: 1, borderColor: 'divider', pt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">Total Amount:</Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {formatCurrency(invoice.amount)}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">Customer</Typography>
            <Typography>
              {invoice.user.full_name}
              {invoice.user.apartment_number && ` (Apartment ${invoice.user.apartment_number})`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceCard;