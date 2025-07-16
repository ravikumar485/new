import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import UnitsPage from './pages/UnitsPage';
import BatchesPage from './pages/BatchesPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/stock">Stock</Link></li>
          <li><Link to="/units">Measuring Units</Link></li>
          <li><Link to="/batches">Batches</Link></li>
          <li><Link to="/">Dashboard</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default App;