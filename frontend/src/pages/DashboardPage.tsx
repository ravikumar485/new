import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../api';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [expired, setExpired] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/low-stock'),
      api.get('/dashboard/expiring-soon'),
      api.get('/dashboard/expired'),
    ]).then(([summaryRes, lowStockRes, expiringRes, expiredRes]) => {
      setSummary(summaryRes.data);
      setLowStock(lowStockRes.data);
      setExpiring(expiringRes.data);
      setExpired(expiredRes.data);
      setLoading(false);
    });
  }, []);

  const summaryCards = [
    { label: 'Total Products', value: summary.total_products, icon: <CheckCircleIcon color="primary" /> },
    { label: 'Low Stock', value: summary.low_stock, icon: <WarningIcon color="warning" /> },
    { label: 'Expiring Soon', value: summary.expiring_soon, icon: <AccessTimeIcon color="secondary" /> },
    { label: 'Expired', value: summary.expired, icon: <CancelIcon color="error" /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2} mb={4}>
        {summaryCards.map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ mr: 2 }}>{item.icon}</Box>
              <CardContent>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="h5">{item.value ?? '-'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {loading ? <Typography>Loading...</Typography> : (
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Low Stock</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Threshold</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStock.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell>{row.threshold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Expiring Soon</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiring.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Expired</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expired.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.expiry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;