import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Order } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const STATUS_LABELS = {
  pending: '待處理 Pending',
  preparing: '製作中 Preparing',
  ready: '可取餐 Ready',
  completed: '已完成 Completed',
  cancelled: '已取消 Cancelled',
};

export default function OrderAdmin() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return () => unsub();
  }, [isAdmin]);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">訂單管理 Order Management</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID / Time</th>
              <th className="p-4 font-semibold text-gray-600 w-1/3">Items</th>
              <th className="p-4 font-semibold text-gray-600">Total</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="text-sm font-mono text-gray-500">{order.id.slice(0, 8)}</p>
                  <p className="text-sm">{order.createdAt ? format(order.createdAt as any, 'HH:mm') : ''}</p>
                </td>
                <td className="p-4">
                  <div className="space-y-1 text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-gray-700">
                         {item.name} ({item.size}) - {item.sugar}/{item.ice}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-semibold">${order.total}</td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                    className="border rounded px-2 py-1 bg-white text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order.id, 'preparing')} className="text-blue-600 text-sm hover:underline">Accept</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'ready')} className="text-green-600 text-sm hover:underline">Mark Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => updateStatus(order.id, 'completed')} className="text-gray-600 text-sm hover:underline">Complete</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
