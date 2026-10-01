import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_KEY = 'pizzahub_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((pizza, size, quantity = 1, addOns = []) => {
    const sizeObj = pizza.sizes.find((s) => s.name === size);
    if (!sizeObj) return;

    const price = sizeObj.discountPrice || sizeObj.price;
    const addOnTotal = addOns.reduce((s, a) => s + a.price, 0);
    const itemKey = `${pizza._id}-${size}-${JSON.stringify(addOns.map(a => a.name).sort())}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === itemKey);
      if (existing) {
        toast.success(`${pizza.name} quantity updated`);
        return prev.map((i) =>
          i.key === itemKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      toast.success(`${pizza.name} added to cart! 🍕`);
      return [
        ...prev,
        {
          key: itemKey,
          pizzaId: pizza._id,
          name: pizza.name,
          image: pizza.image,
          size,
          price: price + addOnTotal,
          basePrice: price,
          addOns,
          quantity,
          isVeg: pizza.isVeg,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.key !== key));
      return;
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : items.length > 0 ? 40 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider value={{
      items, itemCount, subtotal, deliveryFee, tax, total,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
