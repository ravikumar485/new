import React, { useEffect, useState } from 'react';
import api from '../api';

type MeasuringUnit = {
  id: number;
  name: string;
  conversion_factor: number;
};

type MeasuringUnitCreate = {
  name: string;
  conversion_factor: number;
};

const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<MeasuringUnitCreate>({ name: '', conversion_factor: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MeasuringUnitCreate | null>(null);

  const fetchUnits = () => {
    setLoading(true);
    api.get<MeasuringUnit[]>('/units').then(res => {
      setUnits(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/units', { ...form, conversion_factor: Number(form.conversion_factor) });
    setForm({ name: '', conversion_factor: 1 });
    fetchUnits();
  };

  // Edit logic
  const startEdit = (unit: MeasuringUnit) => {
    setEditingId(unit.id);
    setEditForm({ name: unit.name, conversion_factor: unit.conversion_factor });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id: number) => {
    if (!editForm) return;
    await api.put(`/units/${id}`, { ...editForm, conversion_factor: Number(editForm.conversion_factor) });
    setEditingId(null);
    setEditForm(null);
    fetchUnits();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Delete logic
  const deleteUnit = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await api.delete(`/units/${id}`);
      fetchUnits();
    }
  };

  return (
    <div>
      <h2>Measuring Units</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input name="name" placeholder="Unit Name" value={form.name} onChange={handleChange} required />
        <input name="conversion_factor" type="number" placeholder="Conversion Factor" value={form.conversion_factor} onChange={handleChange} required />
        <button type="submit">Add Unit</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={4} cellSpacing={0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Conversion Factor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <tr key={unit.id}>
                {editingId === unit.id ? (
                  <>
                    <td><input name="name" value={editForm?.name || ''} onChange={handleEditChange} /></td>
                    <td><input name="conversion_factor" type="number" value={editForm?.conversion_factor || 1} onChange={handleEditChange} /></td>
                    <td>
                      <button onClick={() => saveEdit(unit.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{unit.name}</td>
                    <td>{unit.conversion_factor}</td>
                    <td>
                      <button onClick={() => startEdit(unit)}>Edit</button>
                      <button onClick={() => deleteUnit(unit.id)}>Delete</button>
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

export default UnitsPage;