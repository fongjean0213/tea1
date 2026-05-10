import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Category, Product } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';

export default function ProductAdmin() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceM, setPriceM] = useState('0');
  const [priceL, setPriceL] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const qC = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubC = onSnapshot(qC, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    });

    const qP = query(collection(db, 'products'));
    const unsubP = onSnapshot(qP, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    return () => { unsubC(); unsubP(); };
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Please select a category");

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          name, categoryId, priceM: Number(priceM), priceL: Number(priceL), isActive
        });
        setEditingId(null);
      } else {
        const id = doc(collection(db, 'products')).id;
        await setDoc(doc(db, 'products', id), {
          name, categoryId, priceM: Number(priceM), priceL: Number(priceL), isActive,
          createdAt: serverTimestamp()
        });
      }
      setName(''); setPriceM('0'); setPriceL('0');
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPriceM(p.priceM.toString());
    setPriceL(p.priceL.toString());
    setIsActive(p.isActive);
  };

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">產品管理 Product Management</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">飲品名稱 Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分類 Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">中杯價格 M Price</label>
            <input type="number" required value={priceM} onChange={e => setPriceM(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大杯價格 L Price</label>
            <input type="number" required value={priceL} onChange={e => setPriceL(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
            <span className="text-sm font-medium text-gray-700">上架 Active</span>
          </label>
          <button type="submit" className="flex-1 bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600">
            {editingId ? '更新 Update' : '新增 Add'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Category</th>
              <th className="p-4 font-semibold text-gray-600">Price (M/L)</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{categories.find(c => c.id === p.categoryId)?.name || 'Unknown'}</td>
                <td className="p-4 text-gray-600">${p.priceM} / ${p.priceL}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-blue-500"><Edit2 className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
