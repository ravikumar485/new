import React, { useEffect, useState } from 'react';
import api from '../api';

type Variant = {
  id?: number;
  name: string;
};

type MeasuringUnit = {
  id?: number;
  name: string;
  conversion_factor: number;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  hsn?: string;
  barcode?: string;
  low_stock_threshold?: number;
  variants: Variant[];
  units: MeasuringUnit[];
};

type ProductCreate = {
  name: string;
  description?: string;
  hsn?: string;
  barcode?: string;
  low_stock_threshold?: number;
  variants: Variant[];
  units: MeasuringUnit[];
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductCreate>({
    name: '',
    description: '',
    hsn: '',
    barcode: '',
    low_stock_threshold: 0,
    variants: [],
    units: [],
  });
  const [variantName, setVariantName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitFactor, setUnitFactor] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductCreate | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get<Product[]>('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addVariant = () => {
    if (variantName.trim()) {
      setForm({ ...form, variants: [...form.variants, { name: variantName }] });
      setVariantName('');
    }
  };

  const removeVariant = (idx: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
  };

  const addUnit = () => {
    if (unitName.trim() && unitFactor) {
      setForm({ ...form, units: [...form.units, { name: unitName, conversion_factor: parseFloat(unitFactor) }] });
      setUnitName('');
      setUnitFactor('');
    }
  };

  const removeUnit = (idx: number) => {
    setForm({ ...form, units: form.units.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', form);
    setForm({
      name: '',
      description: '',
      hsn: '',
      barcode: '',
      low_stock_threshold: 0,
      variants: [],
      units: [],
    });
    fetchProducts();
  };

  // Edit logic
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      description: product.description,
      hsn: product.hsn,
      barcode: product.barcode,
      low_stock_threshold: product.low_stock_threshold,
      variants: product.variants,
      units: product.units,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id: number) => {
    if (!editForm) return;
    await api.put(`/products/${id}`, editForm);
    setEditingId(null);
    setEditForm(null);
    fetchProducts();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Delete logic
  const deleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>
        <div>
          <input name="hsn" placeholder="HSN" value={form.hsn} onChange={handleChange} />
        </div>
        <div>
          <input name="barcode" placeholder="Barcode" value={form.barcode} onChange={handleChange} />
        </div>
        <div>
          <input name="low_stock_threshold" type="number" placeholder="Low Stock Threshold" value={form.low_stock_threshold} onChange={handleChange} />
        </div>
        <div>
          <strong>Variants:</strong>
          <ul>
            {form.variants.map((v, i) => (
              <li key={i}>{v.name} <button type="button" onClick={() => removeVariant(i)}>Remove</button></li>
            ))}
          </ul>
          <input placeholder="Variant name" value={variantName} onChange={e => setVariantName(e.target.value)} />
          <button type="button" onClick={addVariant}>Add Variant</button>
        </div>
        <div>
          <strong>Measuring Units:</strong>
          <ul>
            {form.units.map((u, i) => (
              <li key={i}>{u.name} ({u.conversion_factor}) <button type="button" onClick={() => removeUnit(i)}>Remove</button></li>
            ))}
          </ul>
          <input placeholder="Unit name" value={unitName} onChange={e => setUnitName(e.target.value)} />
          <input placeholder="Conversion factor" type="number" value={unitFactor} onChange={e => setUnitFactor(e.target.value)} />
          <button type="button" onClick={addUnit}>Add Unit</button>
        </div>
        <button type="submit">Create Product</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={4} cellSpacing={0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>HSN</th>
              <th>Barcode</th>
              <th>Variants</th>
              <th>Units</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                {editingId === product.id ? (
                  <>
                    <td><input name="name" value={editForm?.name || ''} onChange={handleEditChange} /></td>
                    <td><input name="description" value={editForm?.description || ''} onChange={handleEditChange} /></td>
                    <td><input name="hsn" value={editForm?.hsn || ''} onChange={handleEditChange} /></td>
                    <td><input name="barcode" value={editForm?.barcode || ''} onChange={handleEditChange} /></td>
                    <td>{product.variants.map(v => v.name).join(', ')}</td>
                    <td>{product.units.map(u => `${u.name} (${u.conversion_factor})`).join(', ')}</td>
                    <td>
                      <button onClick={() => saveEdit(product.id)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.hsn}</td>
                    <td>{product.barcode}</td>
                    <td>{product.variants.map(v => v.name).join(', ')}</td>
                    <td>{product.units.map(u => `${u.name} (${u.conversion_factor})`).join(', ')}</td>
                    <td>
                      <button onClick={() => startEdit(product)}>Edit</button>
                      <button onClick={() => deleteProduct(product.id)}>Delete</button>
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

export default ProductsPage;