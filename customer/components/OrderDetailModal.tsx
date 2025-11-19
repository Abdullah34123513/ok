
import React from 'react';
import type { Order, CartItem } from '@shared/types';
import { CloseIcon, NoteIcon, MoneyIcon } from './Icons';
import { useCart } from '@contexts/CartContext';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { addItem } = useCart();

  const handleReorder = async () => {
    // Loop through items and add them to cart
    for (const item of order.items) {
        // We need to construct the MenuItem and call addItem. 
        // Assuming availability checks happen inside addItem or we might face issues if menu changed.
        // Ideally we would fetch fresh menu data, but for "Quick Re-order" based on history:
        await addItem(item.baseItem, item.quantity, item.selectedCustomizations, item.baseItem.price + item.selectedCustomizations.reduce((acc, cust) => acc + cust.choices.reduce((a, c) => a + c.price, 0), 0));
    }
    window.location.hash = '#/cart';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up flex flex-col max-h-[90vh]">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500 font-mono">{order.id}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <CloseIcon />
            </button>
        </header>

        <main className="p-6 overflow-y-auto">
            <div className="mb-4">
                <p className="font-bold text-lg">{order.restaurantName}</p>
                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {order.items.map((item: CartItem) => (
                    <div key={item.cartItemId} className="flex justify-between text-sm border-b pb-2 last:border-0">
                        <div>
                            <span className="font-semibold">{item.quantity} x {item.baseItem.name}</span>
                            {item.selectedCustomizations.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {item.selectedCustomizations.map(c => c.choices.map(ch => ch.name).join(', ')).join(', ')}
                                </p>
                            )}
                        </div>
                        <span className="font-medium">৳{item.totalPrice.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-2 pt-2 border-t text-sm">
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>৳{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>৳{order.deliveryFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-৳{order.discount.toFixed(2)}</span>
                    </div>
                )}
                {order.tip !== undefined && order.tip > 0 && (
                    <div className="flex justify-between text-blue-600">
                        <span>Rider Tip</span>
                        <span>৳{order.tip.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>৳{order.total.toFixed(2)}</span>
                </div>
            </div>

            {order.deliveryInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
                    <div className="flex items-center font-bold mb-1"><NoteIcon className="w-4 h-4 mr-1"/> Note:</div>
                    {order.deliveryInstructions}
                </div>
            )}
        </main>

        <footer className="p-4 border-t bg-gray-50 rounded-b-lg">
            <button
                onClick={handleReorder}
                className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition duration-300"
            >
                Re-order Items
            </button>
        </footer>
      </div>
    </div>
  );
};

export default OrderDetailModal;
