import React from 'react';

interface OrderConfirmationPageProps {
    orderId: string;
    onGoHome: () => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, onGoHome }) => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
            <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl text-center max-w-lg animate-fade-in-up">
                <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">Thank you for your order. We've received it and will start preparing it right away.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Your Order ID is:</p>
                    <p className="text-xl font-mono font-bold text-gray-800 tracking-wider">{orderId}</p>
                </div>
                <button 
                    onClick={onGoHome}
                    className="w-full mt-8 bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
