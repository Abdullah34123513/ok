import * as api from './api';

// We get the user information from localStorage to avoid dependency cycles
// and to be able to call this from anywhere without needing React context hooks directly.
const getUserId = (): string | undefined => {
    try {
        const storedUser = localStorage.getItem('foodie-find-user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            return user.email;
        }
    } catch (e) {
        console.error("Could not get user for tracking", e);
    }
    return undefined;
}


/**
 * Tracks a user event and sends it to the backend.
 * @param eventName The name of the event (e.g., 'view_food_detail').
 * @param payload A JSON object with details about the event.
 */
export const trackEvent = (eventName: string, payload: Record<string, any>) => {
    const userEmail = getUserId();
    
    // We don't want to block user interaction, so this is fire-and-forget.
    api.logTrackingEvent(eventName, payload, userEmail)
        .catch(error => {
            // In a real app, you might queue this event to be sent later.
            console.error("Failed to log tracking event:", error);
        });
};
