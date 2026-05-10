import { Link } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { loginWithGoogle, logout } from '../lib/firebase';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-orange-500" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">五十茶 50Tea</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                後台管理
              </Link>
            )}
            
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4 ml-2">
                <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                  我的訂單
                </Link>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                   <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-orange-500 transition-colors"
                  title="登出"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors"
              >
                <LogIn className="h-4 w-4" /> 登入
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
