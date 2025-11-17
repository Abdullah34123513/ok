import React from 'react';

interface MasqueradeBannerProps {
    vendorName: string;
}

const MasqueradeBanner: React.FC<MasqueradeBannerProps> = ({ vendorName }) => {

    const handleStopMasquerade = () => {
        const MODERATOR_STORAGE_KEY = 'foodie-find-moderator-user';
        const VENDOR_STORAGE_KEY = 'foodie-find-vendor-user';
        const MASQUERADE_SESSION_KEY = 'foodie-find-original-moderator';

        const originalModerator = sessionStorage.getItem(MASQUERADE_SESSION_KEY);
        if (originalModerator) {
            // Clear vendor and masquerade session
            localStorage.removeItem(VENDOR_STORAGE_KEY);
            sessionStorage.removeItem(MASQUERADE_SESSION_KEY);

            // Restore moderator session
            localStorage.setItem(MODERATOR_STORAGE_KEY, originalModerator);

            // Redirect back to moderator dashboard
            window.location.href = '/moderator/#/vendors';
        } else {
            // Failsafe, just log out
            alert('Original session not found. Logging out.');
            localStorage.removeItem(VENDOR_STORAGE_KEY);
            window.location.href = '/moderator/';
        }
    };

    return (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-semibold z-50 sticky top-0">
            <span>
                ⚠️ You are currently acting as <strong>{vendorName}</strong>.
            </span>
            <button
                onClick={handleStopMasquerade}
                className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-xs font-bold"
            >
                Stop Acting as Vendor
            </button>
        </div>
    );
};

export default MasqueradeBanner;
