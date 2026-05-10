import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Clock, CheckCircle2, ChevronRight, XCircle, RotateCw } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparing: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  pending: '待處理 Pending',
  preparing: '製作中 Preparing',
  ready: '可取餐 Ready',
  completed: '已完成 Completed',
  cancelled: '已取消 Cancelled',
};

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4" />,
  preparing: <RotateCw className="w-4 h-4 animate-spin-slow" />,
  ready: <CheckCircle2 className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return () => unsub();
  }, [user]);

  if (!user) {
    return <div className="text-center py-20 text-gray-500">Please login to view your orders.</div>;
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-20 text-gray-500">You have no orders yet.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">我的訂單 My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-mono">ID: {order.id.slice(0, 8)}</p>
                <p className="text-sm font-medium text-gray-700">
                  {order.createdAt ? format(order.createdAt as any, 'yyyy-MM-dd HH:mm') : ''}
                </p>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}>
                {STATUS_ICONS[order.status]}
                {STATUS_LABELS[order.status]}
              </div>
            </div>

            <div className="p-6">
              <ul className="space-y-4">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      <span className="ml-2 text-sm text-gray-500">x 1</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size} • {item.sugar} • {item.ice}
                      </p>
                    </div>
                    <span className="text-gray-900 font-medium">${item.price}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-medium text-gray-500">總計</span>
                <span className="text-xl font-bold text-gray-900">${order.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
