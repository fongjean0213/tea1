import { useState } from 'react';
import { Product, OrderItem } from '../lib/types';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const SUGAR_LEVELS = ['正常糖 (100%)', '少糖 (70%)', '半糖 (50%)', '微糖 (25%)', '無糖 (0%)'];
const ICE_LEVELS = ['正常冰', '少冰', '微冰', '去冰', '溫熱飲'];

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  
  const [size, setSize] = useState<'M' | 'L'>(product.priceM > 0 ? 'M' : 'L');
  const [sugar, setSugar] = useState(SUGAR_LEVELS[0]);
  const [ice, setIce] = useState(ICE_LEVELS[0]);
  const [quantity, setQuantity] = useState(1);

  const price = size === 'M' ? product.priceM : product.priceL;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        size,
        price,
        sugar,
        ice
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4 transition-opacity">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:fade-in duration-200">
        <div className="relative p-6 border-b border-gray-100">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold pr-12">{product.name}</h2>
          <p className="text-orange-600 font-semibold mt-2">${price}</p>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Size */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">容量 Size</h3>
            <div className="flex gap-3">
              {product.priceM > 0 && (
                <button 
                  onClick={() => setSize('M')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-center font-medium transition-colors ${size === 'M' ? 'bg-orange-50-500 border-orange-500 text-orange-600 font-bold bg-orange-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  中杯 (M)
                </button>
              )}
              {product.priceL > 0 && (
                <button 
                  onClick={() => setSize('L')}
                  className={`flex-1 py-3 px-4 rounded-xl border text-center font-medium transition-colors ${size === 'L' ? 'bg-orange-50-500 border-orange-500 text-orange-600 font-bold bg-orange-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  大杯 (L)
                </button>
              )}
            </div>
          </div>

          {/* Sugar */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">甜度 Sugar</h3>
            <div className="flex flex-wrap gap-2">
              {SUGAR_LEVELS.map(level => (
                <button 
                  key={level}
                  onClick={() => setSugar(level)}
                  className={`py-2 px-4 rounded-full border text-sm font-medium transition-colors ${sugar === level ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Ice */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">冰塊 Ice</h3>
            <div className="flex flex-wrap gap-2">
              {ICE_LEVELS.map(level => (
                <button 
                  key={level}
                  onClick={() => setIce(level)}
                  className={`py-2 px-4 rounded-full border text-sm font-medium transition-colors ${ice === level ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full py-1 px-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
            >
              <Minus className="w-5 h-5"/>
            </button>
            <span className="w-4 text-center font-bold">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
            >
              <Plus className="w-5 h-5"/>
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Add to Cart - ${price * quantity}
          </button>
        </div>
      </div>
    </div>
  );
}
