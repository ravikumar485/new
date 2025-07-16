import React, { useEffect, useState } from 'react';
import api from '../api';

type Supplier = {
  id: number;
  name: string;
};

type StockEntry = {
  id: number;
  batch_id: number;
  measuring_unit_id: number;
  quantity: number;
  purchase_price: number;
  entry_date?: string;
  supplier_id?: number;
};

type StockEntryCreate = {
  batch_id: number;
  measuring_unit_id: number;
  quantity: number;
  purchase_price: number;
  entry_date?: string;
  supplier_id?: number;
};

type Batch = {
  id: number;
  batch_number: string;
};

type MeasuringUnit = {
  id: number;
  name: string;
};

const StockPage: React.FC = () => {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<StockEntryCreate>({
    batch_id: 0,
    measuring_unit_id: 0,
    quantity: 0,
    purchase_price: 0,
    entry_date: '',
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StockEntryCreate | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchStock = () => {
    setLoading(true);
    api.get<StockEntry[]>('/stock').then(res => {
      setStock(res.data);
      setLoading(false);
    });
  };

  const fetchBatches = () => {
    api.get<Batch[]>('/batches').then(res => setBatches(res.data));
  };
  const fetchUnits = () => {
    api.get<MeasuringUnit[]>('/units').then(res => setUnits(res.data));
  };
  const fetchSuppliers = () => {
    api.get<Supplier[]>('/suppliers').then(res => setSuppliers(res.data));
  };

  useEffect(() => {
    fetchStock();
    fetchBatches();
    fetchUnits();
    fetchSuppliers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/stock', { ...form, quantity: Number(form.quantity), purchase_price: Number(form.purchase_price) });
    setForm({ batch_id: 0, measuring_unit_id: 0, quantity: 0, purchase_price: 0, entry_date: '', supplier_id: undefined });
    fetchStock();
  };

  // Edit logic
  const startEdit = (entry: StockEntry) => {
    setEditingId(entry.id);
    setEditForm({
      batch_id: entry.batch_id,
      measuring_unit_id: entry.measuring_unit_id,
      quantity: entry.quantity,
      purchase_price: entry.purchase_price,
      entry_date: entry.entry_date,
      supplier_id: entry.supplier_id,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id: number) => {
    if (!editForm) return;
    await api.put(`/stock/${id}`, { ...editForm, quantity: Number(editForm.quantity), purchase_price: Number(editForm.purchase_price) });
    setEditingId(null);
    setEditForm(null);
    fetchStock();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Delete logic
  const deleteEntry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      await api.delete(`/stock/${id}`);
      fetchStock();
    }
  };

  return (
    <div>
      <h2>Stock Entries</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <select name="batch_id" value={form.batch_id} onChange={handleChange} required>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
          </select>
        </div>
        <div>
          <select name="measuring_unit_id" value={form.measuring_unit_id} onChange={handleChange} required>
            <option value="">Select Unit</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <select name="supplier_id" value={form.supplier_id || ''} onChange={handleChange} required>
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
        </div>
        <div>
          <input name="purchase_price" type="number" placeholder="Purchase Price" value={form.purchase_price} onChange={handleChange} required />
        </div>
        <div>
          <input name="entry_date" type="date" placeholder="Entry Date" value={form.entry_date || ''} onChange={handleChange} />
        </div>
        <button type="submit">Add Stock Entry</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={4} cellSpacing={0}>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Entry Date</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(entry => (
              <tr key={entry.id}>
                {editingId === entry.id ? (
                  <>
                    <td>
                      <select name="batch_id" value={editForm?.batch_id} onChange={handleEditChange} required>
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
                      </select>
                    </td>
                    <td>
                      <select name="measuring_unit_id" value={editForm?.measuring_unit_id} onChange={handleEditChange} required>
                        <option value="">Select Unit</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select name="supplier_id" value={editForm?.supplier_id || ''} onChange={handleEditChange} required>
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td><input name="quantity" type="number" value={editForm?.quantity} onChange={handleEditChange} /></td>
                    <td><input name="purchase_price" type="number" value={editForm?.purchase_price} onChange={handleEditChange} /></td>
                    <td><input name="entry_date" type="date" value={editForm?.entry_date || ''} onChange={handleEditChange} /></td>
                    <td>
                      <button onClick={() => saveEdit(entry.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{batches.find(b => b.id === entry.batch_id)?.batch_number || entry.batch_id}</td>
                    <td>{units.find(u => u.id === entry.measuring_unit_id)?.name || entry.measuring_unit_id}</td>
                    <td>{entry.quantity}</td>
                    <td>{entry.purchase_price}</td>
                    <td>{entry.entry_date ? entry.entry_date.split('T')[0] : ''}</td>
                    <td>{suppliers.find(s => s.id === entry.supplier_id)?.name || ''}</td>
                    <td>
                      <button onClick={() => startEdit(entry)}>Edit</button>
                      <button onClick={() => deleteEntry(entry.id)}>Delete</button>
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

export default StockPage;