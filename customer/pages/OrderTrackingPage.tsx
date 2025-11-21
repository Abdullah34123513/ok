
import React, { useState, useEffect, useRef } from 'react';
import * as api from '@shared/api';
import type { Order, LocationPoint, CartItem } from '@shared/types';
import MapMock from '@components/MapMock';
import { PhoneIcon, StarIcon, LockClosedIcon } from '@components/Icons';
import { useBrowserNotification } from '@shared/hooks/useBrowserNotification';

interface OrderTrackingPageProps {
  orderId: string;
}

const TRACKING_STATUSES: Order['status'][] = ['Placed', 'Preparing', 'On its way', 'Delivered'];
const STATUS_LABELS: Record<Order['status'], string> = {
    'Pending': 'Pending',
    'Placed': 'Order Placed',
    'Preparing': 'Rider heading to restaurant',
    'On its way': 'Food is on its way!',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled',
};

const OrderTrackingPageSkeleton = () => (
    <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Status Bar Skeleton */}
            <div className="mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="flex justify-between items-center relative">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 text-center">
                            <div className="w-8 h-8 mx-auto rounded-full bg-gray-200"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                        </div>
                    ))}
                    <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                </div>
            </div>

            {/* Map Skeleton */}
            <div className="mb-6 h-80 bg-gray-200 rounded-lg"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Summary Skeleton */}
                <div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="bg-gray-100 p-4 rounded-lg space-y-2 h-32"></div>
                    <div className="border-t pt-3 mt-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-5 bg-gray-200 rounded mt-1"></div>
                    </div>
                </div>

                {/* Rider & Contact Skeleton */}
                <div>
                     <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                     <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                     </div>
                </div>
            </div>
        </div>
    </div>
);

const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [riderLocation, setRiderLocation] = useState<LocationPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { requestPermission, sendNotification } = useBrowserNotification();
  const prevStatusRef = useRef<Order['status'] | null>(null);

  useEffect(() => {
      // Auto-request permission for tracking
      requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderDetails = async () => {
        try {
            const data = await api.getOrderDetails(orderId);
            if (isMounted && data) {
                // FIX: Create a shallow copy of data. Since the mock API returns a reference
                // to the same object, React's object comparison would bail out of the update
                // if we passed 'data' directly, preventing the UI from showing status changes.
                setOrder({ ...data });
                
                if (data.rider?.location) {
                    setRiderLocation(data.rider.location);
                }
                
                // Check for status change
                if (prevStatusRef.current && prevStatusRef.current !== data.status) {
                    sendNotification(`Order Update: ${STATUS_LABELS[data.status]}`, {
                        body: `Your order from ${data.restaurantName} is updated.`
                    });
                }
                prevStatusRef.current = data.status;
            }
        } catch (error) {
            console.error("Failed to fetch order details", error);
        } finally {
            if (isMounted && isLoading) setIsLoading(false);
        }
    };

    fetchOrderDetails();
    const intervalId = setInterval(fetchOrderDetails, 10000); // Poll status every 10s

    return () => {
        isMounted = false;
        clearInterval(intervalId);
    };
  }, [orderId, isLoading, sendNotification]);

  useEffect(() => {
    if (!order || (order.status !== 'On its way' && order.status !== 'Preparing')) return;

    const intervalId = setInterval(() => {
      api.getRiderLocation(orderId).then((location: LocationPoint | null) => {
        if (location) {
          setRiderLocation(location);
        }
      });
    }, 5000); // Poll rider location more frequently (every 5s)

    return () => clearInterval(intervalId);
  }, [orderId, order?.status]); // Changed dependency to verify status specifically

  if (isLoading) {
    return <OrderTrackingPageSkeleton />;
  }

  if (!order) {
    return <div className="text-center p-20">Order not found.</div>;
  }
  
  const currentStatusIndex = TRACKING_STATUSES.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
         <div className="mb-4">
             <h1 className="text-2xl font-bold text-gray-800">Live Delivery Tracking</h1>
             <p className="text-gray-500">Order ID: {orderId}</p>
         </div>
        {/* Status Bar */}
        <div className="mb-8">
            <h2 className="font-bold text-xl mb-2">Order Status</h2>
            <div className="flex justify-between items-center relative">
                {TRACKING_STATUSES.map((status, index) => (
                    <div key={status} className="flex-1 text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors ${index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index < currentStatusIndex ? '✓' : index + 1}
                        </div>
                        <p className={`mt-2 text-xs sm:text-sm font-semibold ${index <= currentStatusIndex ? 'text-green-600' : 'text-gray-500'}`}>{STATUS_LABELS[status]}</p>
                    </div>
                ))}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -z-10">
                    <div className="h-1 bg-green-500 transition-all duration-500" style={{ width: `${(currentStatusIndex / (TRACKING_STATUSES.length - 1)) * 100}%` }}></div>
                </div>
            </div>
        </div>

        {/* OTP Display Section */}
        {order.status === 'On its way' && order.deliveryOtp && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center animate-fade-in-up">
                <p className="text-sm text-yellow-800 font-semibold mb-1">Share this PIN with the Rider</p>
                <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-3xl font-mono font-bold text-yellow-900 tracking-widest">{order.deliveryOtp}</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">The rider will ask for this code to confirm delivery.</p>
            </div>
        )}

        {/* Map Section */}
        <div className="mb-6">
          <MapMock 
            restaurantLocation={order.restaurantLocation}
            deliveryLocation={order.deliveryLocation}
            riderLocation={riderLocation}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div>
                <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                    {order.items.map((item: CartItem) => (
                        <div key={item.cartItemId} className="flex justify-between text-sm">
                            <span className="truncate pr-2">{item.quantity} x {item.baseItem.name}</span>
                            <span className="font-semibold">৳{item.totalPrice.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-3 mt-3 space-y-1">
                    <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">৳{order.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span>Delivery Fee</span><span className="font-medium">৳{order.deliveryFee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Total</span><span>৳{order.total.toFixed(2)}</span></div>
                </div>
            </div>

            {/* Rider & Contact */}
            <div>
                 <h3 className="font-bold text-lg mb-2">Delivery Details</h3>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    {order.rider && (
                        <div className="flex items-center space-x-4 mb-4">
                            <img src={`https://i.pravatar.cc/48?u=${order.rider.name}`} alt={order.rider.name} className="w-12 h-12 rounded-full"/>
                            <div>
                                <p className="font-bold">{order.rider.name}</p>
                                <div className="flex items-center text-sm">
                                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span>{order.rider.rating}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span>{order.rider.vehicle}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <p className="font-semibold text-sm">Estimated Delivery Time:</p>
                    <p className="font-bold text-red-500 text-xl mb-4">{order.estimatedDeliveryTime}</p>
                    
                    <div className="flex">
                        <a 
                            href={order.rider?.phone ? `tel:${order.rider.phone}` : undefined}
                            className={`w-full flex items-center justify-center py-2 px-3 border rounded-lg text-sm font-semibold transition ${
                                order.rider?.phone 
                                ? 'bg-white border-gray-300 hover:bg-gray-100' 
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                            aria-disabled={!order.rider?.phone}
                            onClick={(e) => !order.rider?.phone && e.preventDefault()}
                        >
                            <PhoneIcon className="mr-2"/> Call Rider
                        </a>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
