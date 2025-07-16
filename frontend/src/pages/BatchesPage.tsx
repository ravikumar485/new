import React, { useEffect, useState } from 'react';
import api from '../api';

type Batch = {
  id: number;
  batch_number: string;
  expiry_date?: string;
  barcode?: string;
};

type BatchCreate = {
  batch_number: string;
  expiry_date?: string;
  barcode?: string;
};

const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<BatchCreate>({ batch_number: '', expiry_date: '', barcode: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<BatchCreate | null>(null);

  const fetchBatches = () => {
    setLoading(true);
    api.get<Batch[]>('/batches').then(res => {
      setBatches(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/batches', form);
    setForm({ batch_number: '', expiry_date: '', barcode: '' });
    fetchBatches();
  };

  // Edit logic
  const startEdit = (batch: Batch) => {
    setEditingId(batch.id);
    setEditForm({ batch_number: batch.batch_number, expiry_date: batch.expiry_date, barcode: batch.barcode });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id: number) => {
    if (!editForm) return;
    await api.put(`/batches/${id}`, editForm);
    setEditingId(null);
    setEditForm(null);
    fetchBatches();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Delete logic
  const deleteBatch = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    }
  };

  return (
    <div>
      <h2>Batches</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input name="batch_number" placeholder="Batch Number" value={form.batch_number} onChange={handleChange} required />
        <input name="expiry_date" type="date" placeholder="Expiry Date" value={form.expiry_date || ''} onChange={handleChange} />
        <input name="barcode" placeholder="Barcode" value={form.barcode} onChange={handleChange} />
        <button type="submit">Add Batch</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={4} cellSpacing={0}>
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Expiry Date</th>
              <th>Barcode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(batch => (
              <tr key={batch.id}>
                {editingId === batch.id ? (
                  <>
                    <td><input name="batch_number" value={editForm?.batch_number || ''} onChange={handleEditChange} /></td>
                    <td><input name="expiry_date" type="date" value={editForm?.expiry_date || ''} onChange={handleEditChange} /></td>
                    <td><input name="barcode" value={editForm?.barcode || ''} onChange={handleEditChange} /></td>
                    <td>
                      <button onClick={() => saveEdit(batch.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{batch.batch_number}</td>
                    <td>{batch.expiry_date ? batch.expiry_date.split('T')[0] : ''}</td>
                    <td>{batch.barcode}</td>
                    <td>
                      <button onClick={() => startEdit(batch)}>Edit</button>
                      <button onClick={() => deleteBatch(batch.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BatchesPage;