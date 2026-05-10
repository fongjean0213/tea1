import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType, loginWithGoogle } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartScreen() {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("請先登入 Please login first.");
      loginWithGoogle();
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, {
        userId: user.uid,
        status: 'pending',
        total,
        items: cart,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      clearCart();
      navigate('/orders');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      alert("Order failed to place.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6 text-gray-400">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">你的購物車是空的</h2>
        <p className="text-gray-500 mb-8">快去點些好喝的茶飲吧！</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors"
        >
          去看看菜單
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">購物車 Cart</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {cart.map((item, index) => (
          <div key={index} className="p-6 flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">{item.name} <span className="text-sm font-normal text-gray-500 ml-1">({item.size})</span></h3>
              <p className="text-sm text-gray-500">
                {item.sugar} • {item.ice}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-semibold text-lg text-gray-900">${item.price}</span>
              <button 
                onClick={() => removeFromCart(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600 font-medium">總計 Total</span>
          <span className="text-3xl font-bold text-gray-900">${total}</span>
        </div>
        
        <button 
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '送出訂單中...' : '確認結帳 Checkout'}
          {!isSubmitting && <ArrowRight className="w-5 h-5"/>}
        </button>
      </div>
    </div>
  );
}
