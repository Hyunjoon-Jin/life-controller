'use client';

import { createClient } from '@/lib/supabase';

// ============================================
// Case Conversion Utilities
// ============================================

/**
 * Convert camelCase key to snake_case
 * e.g., "dueDate" → "due_date", "connectedGoalId" → "connected_goal_id"
 */
function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case key to camelCase
 * e.g., "due_date" → "dueDate", "connected_goal_id" → "connectedGoalId"
 */
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert all keys in an object from camelCase to snake_case.
 * Preserves arrays, dates, and nested objects.
 */
export function toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    if (typeof obj !== 'object') return obj;

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = camelToSnake(key);
        // Don't recursively convert JSONB fields — they stay as-is
        result[snakeKey] = value;
    }
    return result;
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase.
 */
export function toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = snakeToCamel(key);
        // Don't recursively convert JSONB fields — they stay as-is
        result[camelKey] = value;
    }
    return result;
}

// ============================================
// Special field mappings (where frontend ↔ DB names differ beyond case)
// ============================================

const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
    calendar_events: {
        // Frontend CalendarEvent uses "start"/"end", DB uses "start_time"/"end_time"
        start: 'start_time',
        end: 'end_time',
        start_time: 'start',
        end_time: 'end',
    },
};

/** Apply special field name mappings for a given table (frontend → DB) */
function applyFieldMappingToDB(table: string, data: any): any {
    const mapping = FIELD_MAPPINGS[table];
    if (!mapping || typeof data !== 'object' || data === null) return data;
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
        const mappedKey = mapping[key] || key;
        result[mappedKey] = value;
    }
    return result;
}

/** Apply special field name mappings for a given table (DB → frontend) */
function applyFieldMappingFromDB(table: string, data: any): any {
    const mapping = FIELD_MAPPINGS[table];
    if (!mapping || typeof data !== 'object' || data === null) return data;
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
        const mappedKey = mapping[key] || key;
        result[mappedKey] = value;
    }
    return result;
}

// ============================================
// Fields to exclude when sending to DB
// ============================================

const EXCLUDE_ON_INSERT = ['createdAt', 'updatedAt', 'created_at', 'updated_at'];

function cleanForDB(data: any): any {
    if (typeof data !== 'object' || data === null) return data;
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (EXCLUDE_ON_INSERT.includes(key)) continue;
        result[key] = value;
    }
    return result;
}

// ============================================
// Generic CRUD Operations
// ============================================

/**
 * Fetch all rows from a table for the authenticated user.
 * Returns camelCase objects.
 */
/**
 * Options for data fetching
 */
export interface DataOptions {
    skipUserFilter?: boolean;
}

/**
 * Fetch all rows from a table for the authenticated user.
 * Returns camelCase objects.
 * By default, enforces `user_id` filter for security.
 */
export async function fetchAll<T>(table: string, options: DataOptions = {}): Promise<T[]> {
    const supabase = createClient();
    let query = supabase.from(table).select('*');

    if (!options.skipUserFilter) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            return []; // No user, no data
        }
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
        console.error(`[supabase-data] fetchAll ${table} error:`, error);
        return [];
    }

    return (data || []).map(row => {
        const mapped = applyFieldMappingFromDB(table, row);
        return toCamelCase(mapped) as T;
    });
}

/**
 * Insert a row into a table.
 * Accepts camelCase data, converts to snake_case for DB.
 * Returns the inserted row as camelCase.
 */
export async function insertRow<T>(table: string, data: Partial<T>): Promise<T | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let dbData = toSnakeCase(cleanForDB(data));
    dbData = applyFieldMappingToDB(table, dbData);
    dbData.user_id = user.id;

    const { data: result, error } = await supabase
        .from(table)
        .insert(dbData)
        .select()
        .single();

    if (error) {
        console.error(`[supabase-data] insertRow ${table} error:`, error);
        return null;
    }

    const mapped = applyFieldMappingFromDB(table, result);
    return toCamelCase(mapped) as T;
}

/**
 * Update a row by ID.
 * Accepts camelCase data, converts to snake_case for DB.
 */
/**
 * Update a row by ID.
 * Accepts camelCase data, converts to snake_case for DB.
 * Enforces `user_id` check to prevent unauthorized updates.
 */
export async function updateRow<T>(table: string, id: string, data: Partial<T>, options: DataOptions = {}): Promise<T | null> {
    const supabase = createClient();

    let dbData = toSnakeCase(cleanForDB(data));
    dbData = applyFieldMappingToDB(table, dbData);
    // Don't send user_id or id in updates
    delete dbData.user_id;
    delete dbData.id;

    let query = supabase.from(table).update(dbData).eq('id', id);

    if (!options.skipUserFilter) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            return null;
        }
    }

    const { data: result, error } = await query.select().single();

    if (error) {
        console.error(`[supabase-data] updateRow ${table} error:`, error);
        return null;
    }

    const mapped = applyFieldMappingFromDB(table, result);
    return toCamelCase(mapped) as T;
}

/**
 * Delete a row by ID.
 */
/**
 * Delete a row by ID.
 * Enforces `user_id` check.
 */
export async function deleteRow(table: string, id: string, options: DataOptions = {}): Promise<boolean> {
    const supabase = createClient();

    let query = supabase.from(table).delete().eq('id', id);

    if (!options.skipUserFilter) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            return false;
        }
    }

    const { error } = await query;

    if (error) {
        console.error(`[supabase-data] deleteRow ${table} error:`, error);
        return false;
    }

    return true;
}

/**
 * Upsert a singleton row (e.g., user_settings, user_profiles).
 * Uses user_id as the conflict key.
 */
export async function upsertSingleton<T>(table: string, data: Partial<T>): Promise<T | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let dbData = toSnakeCase(cleanForDB(data));
    dbData = applyFieldMappingToDB(table, dbData);
    dbData.user_id = user.id;

    const { data: result, error } = await supabase
        .from(table)
        .upsert(dbData, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        console.error(`[supabase-data] upsertSingleton ${table} error:`, error);
        return null;
    }

    const mapped = applyFieldMappingFromDB(table, result);
    return toCamelCase(mapped) as T;
}

/**
 * Fetch a singleton row (user_profiles, user_settings) for the authenticated user.
 */
/**
 * Fetch a singleton row (user_profiles, user_settings) for the authenticated user.
 * Enforces `user_id` check.
 */
export async function fetchSingleton<T>(table: string, options: DataOptions = {}): Promise<T | null> {
    const supabase = createClient();

    let query = supabase.from(table).select('*');

    if (!options.skipUserFilter) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            query = query.eq('user_id', user.id);
        } else {
            return null;
        }
    }

    const { data, error } = await query.single();

    if (error) {
        // PGRST116 means no rows found — not a real error for singletons
        if (error.code === 'PGRST116') return null;
        console.error(`[supabase-data] fetchSingleton ${table} error:`, error);
        return null;
    }

    const mapped = applyFieldMappingFromDB(table, data);
    return toCamelCase(mapped) as T;
}
