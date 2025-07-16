import React, { useEffect, useState } from 'react';
import api from '../api';

type Variant = {
  id: number;
  name: string;
};

type MeasuringUnit = {
  id: number;
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

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Product[]>('/products').then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>HSN</th>
              <th>Barcode</th>
              <th>Variants</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.hsn}</td>
                <td>{product.barcode}</td>
                <td>{product.variants.map(v => v.name).join(', ')}</td>
                <td>{product.units.map(u => `${u.name} (${u.conversion_factor})`).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductsPage;