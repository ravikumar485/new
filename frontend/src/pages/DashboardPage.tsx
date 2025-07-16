import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const mockSummary = [
  { label: 'Total Products', value: 120, icon: <CheckCircleIcon color="primary" /> },
  { label: 'Low Stock', value: 8, icon: <WarningIcon color="warning" /> },
  { label: 'Expiring Soon', value: 5, icon: <AccessTimeIcon color="secondary" /> },
  { label: 'Expired', value: 2, icon: <CancelIcon color="error" /> },
];

const mockLowStock = [
  { name: 'Product A', stock: 3, threshold: 5 },
  { name: 'Product B', stock: 2, threshold: 4 },
];

const mockExpiring = [
  { name: 'Batch X', product: 'Product A', expiry: '2024-08-10' },
  { name: 'Batch Y', product: 'Product B', expiry: '2024-08-15' },
];

const mockExpired = [
  { name: 'Batch Z', product: 'Product C', expiry: '2024-06-01' },
];

const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2} mb={4}>
        {mockSummary.map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ mr: 2 }}>{item.icon}</Box>
              <CardContent>
                <Typography variant="h6">{item.label}</Typography>
                <Typography variant="h5">{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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
                {mockLowStock.map((row, idx) => (
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
                {mockExpiring.map((row, idx) => (
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
                {mockExpired.map((row, idx) => (
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
    </Box>
  );
};

export default DashboardPage;