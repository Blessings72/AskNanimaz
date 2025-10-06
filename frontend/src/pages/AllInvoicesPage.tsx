import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { invoicesApi } from '../services/invoicesApi';
import InvoiceList from '../components/Invoices/InvoiceList';
import GenerateInvoiceDialog from '../components/Invoices/GenerateInvoiceDialog';
import type { InvoiceResponse } from '../types';

const AllInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });

  const { user } = useAuth();

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'all' ? { paid: statusFilter === 'paid' } : undefined;
      const response = await invoicesApi.getAllInvoices(params);
      setInvoices(response.invoices);
      
      // Load summary from API
      const summaryData = await invoicesApi.getInvoiceSummary();
      setSummary({
        total: summaryData.total_invoices,
        paid: summaryData.paid_invoices,
        pending: summaryData.pending_invoices,
        totalAmount: summaryData.total_amount,
        paidAmount: summaryData.paid_amount,
        pendingAmount: summaryData.pending_amount,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const handleInvoiceUpdate = (updatedInvoice: InvoiceResponse) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    loadInvoices(); // Reload to update summary
  };

  const handleInvoicesGenerated = (newInvoices: InvoiceResponse[]) => {
    setGenerateDialogOpen(false);
    loadInvoices(); // Reload to show new invoices
  };

  // Only managers and admins can access this page
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <Alert severity="error">
        You don't have permission to view this page. Only managers and administrators can access all invoices.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          All Invoices
        </Typography>
        <Button
          variant="contained"
          startIcon={<Receipt />}
          onClick={() => setGenerateDialogOpen(true)}
        >
          Generate Invoices
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4">
                {summary.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ${summary.totalAmount.toFixed(2)} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid Invoices
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary.paid}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ${summary.paidAmount.toFixed(2)} collected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Invoices
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ${summary.pendingAmount.toFixed(2)} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Filter by Status</InputLabel>
        <Select
          value={statusFilter}
          label="Filter by Status"
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'pending')}
        >
          <MenuItem value="all">All Invoices</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>
      </FormControl>

      <InvoiceList
        invoices={invoices}
        loading={loading}
        error={error}
        onInvoiceUpdate={handleInvoiceUpdate}
      />

      <GenerateInvoiceDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onInvoicesGenerated={handleInvoicesGenerated}
      />
    </Box>
  );
};

export default AllInvoicesPage;