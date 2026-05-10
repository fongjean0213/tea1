import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Category } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';

export default function CategoryAdmin() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [order, setOrder] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    return () => unsub();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), {
          name,
          order: Number(order)
        });
        setEditingId(null);
      } else {
        const id = doc(collection(db, 'categories')).id;
        await setDoc(doc(db, 'categories', id), {
          name,
          order: Number(order),
          createdAt: serverTimestamp()
        });
      }
      setName('');
      setOrder('0');
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'categories');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setOrder(cat.order.toString());
  };

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">分類管理 Category Management</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">分類名稱 Title</label>
          <input 
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-orange-500" 
          />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-1">排序 Order</label>
          <input 
            type="number" required value={order} onChange={e => setOrder(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-orange-500" 
          />
        </div>
        <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
          {editingId ? '更新 Update' : '新增 Add'}
        </button>
      </form>

      <ul className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {categories.map(cat => (
          <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
              <span className="font-medium mr-4">{cat.name}</span>
              <span className="text-sm text-gray-400">Order: {cat.order}</span>
            </div>
            <div className="flex gap-2 text-gray-400">
              <button onClick={() => startEdit(cat)} className="hover:text-blue-500"><Edit2 className="w-5 h-5"/></button>
              <button onClick={() => handleDelete(cat.id)} className="hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
