import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Always initialize with the default value to avoid hydration mismatch
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Read from local storage only on the client-side after mount
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item, (key, value) => {
                    // ISO 8601 Date Pattern: YYYY-MM-DDTHH:mm:ss.sssZ
                    const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;
                    if (typeof value === "string" && dateFormat.test(value)) {
                        return new Date(value);
                    }
                    return value;
                }));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
        }
    }, [key]);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;

                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key]);

    return [storedValue, setValue] as const;
}
