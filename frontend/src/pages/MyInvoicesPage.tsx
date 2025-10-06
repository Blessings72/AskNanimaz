import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { invoicesApi } from '../services/invoicesApi';
import InvoiceList from '../components/Invoices/InvoiceList';
import type { InvoiceResponse } from '../types';

const MyInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalAmount: 0,
  });

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'all' ? { paid: statusFilter === 'paid' } : undefined;
      const response = await invoicesApi.getMyInvoices(params);
      setInvoices(response.invoices);
      
      // Calculate summary
      const total = response.invoices.length;
      const paid = response.invoices.filter(inv => inv.paid).length;
      const pending = total - paid;
      const totalAmount = response.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      setSummary({ total, paid, pending, totalAmount });
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Invoices
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4">
                {summary.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Paid
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary.paid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4">
                ${summary.totalAmount.toFixed(2)}
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
    </Box>
  );
};

export default MyInvoicesPage;