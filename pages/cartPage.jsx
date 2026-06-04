import { Link } from "react-router-dom";
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineMinus,
  HiOutlinePlus,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";

export default function CartPage() {
  const { items, subtotal, cartCount, updateQuantity, removeFromCart, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-base-100">
        <HiOutlineShoppingCart className="w-20 h-20 text-base-content/20 mb-4" />
        <h1 className="text-2xl font-bold text-base-content">Your cart is empty</h1>
        <p className="text-base-content/60 mt-2 mb-6">Add products to get started.</p>
        <Link to="/products" className="btn btn-primary gap-2">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-base-200/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <HiOutlineShoppingCart className="w-8 h-8 text-primary" />
              Shopping Cart
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-ghost btn-sm text-error"
          >
            Clear cart
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="card bg-base-100 shadow-sm border border-base-200/80"
            >
              <div className="card-body p-4 sm:p-5 flex flex-row gap-4">
                <Link
                  to={`/products/${item.productId}`}
                  className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-base-200"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiOutlineShoppingCart className="w-8 h-8 text-base-content/20" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-base-content hover:text-primary line-clamp-2"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-base-content/50 font-mono mt-0.5">
                    {item.productId}
                  </p>
                  <p className="text-lg font-bold text-primary mt-auto pt-2">
                    ${(item.price * item.quantity).toFixed(2)}
                    <span className="text-sm font-normal text-base-content/50 ml-1">
                      (${Number(item.price).toFixed(2)} each)
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="btn btn-ghost btn-sm btn-square text-error"
                    aria-label="Remove"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1 border border-base-300 rounded-lg">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <HiOutlineMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-base-100 shadow-md border border-base-200/80 mt-8">
          <div className="card-body">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-base-content/50">Shipping and taxes calculated at checkout.</p>
            <div className="card-actions flex-col sm:flex-row gap-2 mt-4">
              <button type="button" className="btn btn-primary flex-1" disabled>
                Checkout (coming soon)
              </button>
              <Link to="/products" className="btn btn-outline flex-1">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
