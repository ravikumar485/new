import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';

type Supplier = {
  id: number;
  name: string;
  contact?: string;
  address?: string;
  gst?: string;
  email?: string;
  phone?: string;
};

type SupplierCreate = Omit<Supplier, 'id'>;

const emptyForm: SupplierCreate = {
  name: '',
  contact: '',
  address: '',
  gst: '',
  email: '',
  phone: '',
};

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SupplierCreate>(emptyForm);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpen = (supplier?: Supplier) => {
    if (supplier) {
      setForm({
        name: supplier.name,
        contact: supplier.contact || '',
        address: supplier.address || '',
        gst: supplier.gst || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
      });
      setEditingId(supplier.id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editingId) {
      await api.put(`/suppliers/${editingId}`, form);
    } else {
      await api.post('/suppliers', form);
    }
    handleClose();
    fetchSuppliers();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/suppliers/${id}`);
    fetchSuppliers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Suppliers</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Supplier</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>{supplier.gst}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(supplier)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(supplier.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Contact" name="contact" value={form.contact} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Address" name="address" value={form.address} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="GST" name="gst" value={form.gst} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuppliersPage;