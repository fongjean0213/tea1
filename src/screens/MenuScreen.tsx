import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category, Product } from '../lib/types';
import ProductModal from '../components/ProductModal';
import { Coffee } from 'lucide-react';

export default function MenuScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const qCategories = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    const qProducts = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)).filter(p => p.isActive));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">FiftyTea Menu</h1>
        <p className="text-lg text-gray-500">Select your favorite tea, just the way you like it.</p>
      </div>

      {categories.map(category => {
        const categoryProducts = products.filter(p => p.categoryId === category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><Coffee className="w-5 h-5"/></span>
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                    <div>
                      {product.priceM > 0 && <span>M ${product.priceM}</span>}
                    </div>
                    <div>
                      {product.priceL > 0 && <span>L ${product.priceL}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
