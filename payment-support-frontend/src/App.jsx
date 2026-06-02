import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OrderDetail from './pages/OrderDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell app-layout">
        <div className="app-backdrop app-backdrop--one" />
        <div className="app-backdrop app-backdrop--two" />
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
