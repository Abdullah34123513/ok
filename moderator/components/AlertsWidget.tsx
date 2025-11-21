
import React from 'react';
import type { SystemAlert } from '@shared/types';
import { ExclamationCircleIcon, ShieldCheckIcon, CloseIcon } from './Icons';

interface AlertsWidgetProps {
    alerts: SystemAlert[];
    onDismiss: (alertId: string) => void;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, onDismiss }) => {
    if (alerts.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center text-green-600">
                <ShieldCheckIcon className="w-8 h-8 mr-3" />
                <span className="font-semibold">All systems normal. No alerts.</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    Suspicious Activities & Alerts ({alerts.length})
                </h3>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 flex items-start space-x-3 ${alert.severity === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                            <ExclamationCircleIcon className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${alert.severity === 'high' ? 'text-red-800' : 'text-yellow-800'}`}>
                                    {alert.title}
                                </h4>
                                <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className={`text-sm mt-1 ${alert.severity === 'high' ? 'text-red-700' : 'text-yellow-700'}`}>
                                {alert.message}
                            </p>
                            {alert.entityId && (
                                <div className="mt-2">
                                    <a 
                                        href={alert.type === 'vendor_rating' ? `#/vendorDetail/${alert.entityId}` : '#/users'} 
                                        className="text-xs font-semibold underline hover:no-underline"
                                    >
                                        View Details &rarr;
                                    </a>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => onDismiss(alert.id)} 
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition"
                            title="Dismiss Alert"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsWidget;
