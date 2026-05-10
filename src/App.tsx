import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import AdminDashboard from './screens/admin/AdminDashboard';
import ProductAdmin from './screens/admin/ProductAdmin';
import CategoryAdmin from './screens/admin/CategoryAdmin';
import OrderAdmin from './screens/admin/OrderAdmin';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<MenuScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/orders" element={<OrdersScreen />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ProductAdmin />} />
                <Route path="/admin/categories" element={<CategoryAdmin />} />
                <Route path="/admin/orders" element={<OrderAdmin />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
