import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Always initialize with the default value to avoid hydration mismatch
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Read from local storage only on the client-side after mount
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Use a ref to store the timeout ID
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Set a new timeout to save to localStorage after 1000ms
                timeoutRef.current = setTimeout(() => {
                    if (typeof window !== "undefined") {
                        try {
                            window.localStorage.setItem(key, JSON.stringify(valueToStore));
                        } catch (error) {
                            console.warn(`Error setting localStorage key “${key}”:`, error);
                        }
                    }
                }, 1000);

                return valueToStore;
            });
        } catch (error) {
            console.warn(`Error setting state for key “${key}”:`, error);
        }
    }, [key]);

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return [storedValue, setValue] as const;
}
