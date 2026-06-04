import { createContext, useContext, useEffect, useState, useCallback } from "react";

const GUEST_CART_KEY = "cart_guest";

const CartContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getCartStorageKey() {
  const user = getStoredUser();
  if (user?.email) return `cart_${user.email}`;
  return GUEST_CART_KEY;
}

function loadCartForCurrentUser() {
  const key = getCartStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    if (key === GUEST_CART_KEY) {
      const legacy = localStorage.getItem("cart");
      if (legacy) {
        localStorage.setItem(GUEST_CART_KEY, legacy);
        localStorage.removeItem("cart");
        return JSON.parse(legacy);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCartForCurrentUser);

  useEffect(() => {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
  }, [items]);

  const reloadCart = useCallback(() => {
    setItems(loadCartForCurrentUser());
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.isAvailable) return { ok: false, message: "Product is unavailable." };

    const qty = Math.max(1, Number(quantity) || 1);
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === product.productId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.productId,
          productName: product.productName,
          price: product.price,
          labeledPrice: product.labeledPrice,
          image: product.images?.[0] ?? "",
          quantity: qty,
        },
      ];
    });
    return { ok: true };
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Number(quantity);
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: qty } : x))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(getCartStorageKey());
  }, []);

  const cartCount = items.reduce((sum, x) => sum + x.quantity, 0);
  const subtotal = items.reduce((sum, x) => sum + x.price * x.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reloadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
