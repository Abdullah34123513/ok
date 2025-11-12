import type { Food, MenuItem, Restaurant, TimeSlot, OperatingHoursForDay } from './types';

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

/**
 * Converts a "HH:mm" time string to the number of minutes from midnight.
 */
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Checks if a given time (in minutes from midnight) is within a time slot.
 */
const isTimeInSlot = (timeInMinutes: number, slot: TimeSlot): boolean => {
    return timeInMinutes >= timeToMinutes(slot.open) && timeInMinutes <= timeToMinutes(slot.close);
};

/**
 * Formats minutes from midnight back to a "h:mm AM/PM" string.
 */
const formatMinutes = (minutes: number): string => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12; // Convert 0 to 12
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

interface AvailabilityResult {
    isAvailable: boolean;
    message: string;
}

export const checkAvailability = (item: Food | MenuItem, restaurant: Restaurant, now: Date = new Date()): AvailabilityResult => {
    if (!restaurant.operatingHours) {
        return { isAvailable: true, message: 'Available' }; // Default to available if no hours are set
    }
    
    const dayOfWeek = days[now.getDay()];
    const todayHours: OperatingHoursForDay = restaurant.operatingHours[dayOfWeek];
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Check if the restaurant is open today at all
    if (!todayHours.isOpen || todayHours.slots.length === 0) {
        return { isAvailable: false, message: 'Restaurant is closed today.' };
    }

    // 2. Check if the current time is within any of the restaurant's open slots
    const isInRestaurantSlot = todayHours.slots.some(slot => isTimeInSlot(currentTimeInMinutes, slot));
    if (!isInRestaurantSlot) {
        // Find the next opening slot today
        const nextSlotToday = todayHours.slots.find(slot => timeToMinutes(slot.open) > currentTimeInMinutes);
        const message = nextSlotToday 
            ? `Restaurant is currently closed. Opens at ${formatMinutes(timeToMinutes(nextSlotToday.open))}.`
            : 'Restaurant is closed for the day.';
        return { isAvailable: false, message };
    }

    // 3. Check for item-specific availability
    const itemAvailability = item.availability;
    if (itemAvailability && itemAvailability.type === 'CUSTOM_TIME' && itemAvailability.startTime && itemAvailability.endTime) {
        const itemSlot: TimeSlot = { open: itemAvailability.startTime, close: itemAvailability.endTime };
        const isInItemSlot = isTimeInSlot(currentTimeInMinutes, itemSlot);

        if (!isInItemSlot) {
            const message = currentTimeInMinutes < timeToMinutes(itemSlot.open)
                ? `This item is available from ${formatMinutes(timeToMinutes(itemSlot.open))}.`
                : 'This item is no longer available today.';
            return { isAvailable: false, message };
        }
    }

    // 4. If all checks pass, the item is available
    return { isAvailable: true, message: 'Available' };
};
