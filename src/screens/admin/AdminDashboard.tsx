import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, ListTree, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return <div className="text-center py-20">Access Denied</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">後台管理 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all group">
          <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">訂單管理</h2>
          <p className="text-gray-500">Manage customer orders, update status</p>
        </Link>
        
        <Link to="/admin/categories" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ListTree className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">分類管理</h2>
          <p className="text-gray-500">Manage menu categories and ordering</p>
        </Link>

        <Link to="/admin/products" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">產品管理</h2>
          <p className="text-gray-500">Manage drinks, pricing, and availability</p>
        </Link>
      </div>
    </div>
  );
}
