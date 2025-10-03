import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [expired, setExpired] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [stockDistribution, setStockDistribution] = useState<any[]>([]);
  const [stockOverTime, setStockOverTime] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/low-stock'),
      api.get('/dashboard/expiring-soon'),
      api.get('/dashboard/expired'),
      api.get('/dashboard/top-products'), // TODO: Implement in backend
      api.get('/dashboard/stock-distribution'), // TODO: Implement in backend
      api.get('/dashboard/stock-over-time'), // TODO: Implement in backend
    ]).then(([
      summaryRes, lowStockRes, expiringRes, expiredRes,
      topProductsRes, stockDistributionRes, stockOverTimeRes
    ]) => {
      setSummary(summaryRes.data);
      setLowStock(lowStockRes.data);
      setExpiring(expiringRes.data);
      setExpired(expiredRes.data);
      setTopProducts(topProductsRes.data);
      setStockDistribution(stockDistributionRes.data);
      setStockOverTime(stockOverTimeRes.data);
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
      {/* Analytics Charts */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Top Products by Stock</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Stock Distribution</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stockDistribution} dataKey="stock" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {stockDistribution.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2'][idx % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Stock Entries Over Time</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stockOverTime} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entries" stroke="#1976d2" />
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
      {/* Summary Cards */}
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