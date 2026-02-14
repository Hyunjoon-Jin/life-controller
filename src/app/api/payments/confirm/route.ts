import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { confirmPayment, TossPaymentError } from '@/lib/toss/toss-server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentKey, orderId, amount, planId } = body;

        if (!paymentKey || !orderId || !amount || !planId) {
            return NextResponse.json({ error: 'Missing required definitions' }, { status: 400 });
        }

        // 1. Confirm Payment with Toss
        const paymentData = await confirmPayment({
            paymentKey,
            orderId,
            amount,
        });

        // 2. Initialize Supabase Client
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )

        // 3. Get User (or use metadata if passed)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Technically, we might want to allow this if we trust the payment flow, 
            // but robustly we want to link it to a user.
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // 4. Update Database
        // Transaction ideally, but Supabase via JS client doesn't support convenient transactions strictly like SQL.
        // We will do optimistic updates.

        // 4.1 Insert Payment Record
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: orderId,
                payment_key: paymentKey,
                amount: amount,
                status: 'DONE',
                method: paymentData.method,
                user_id: user.id,
                requested_at: new Date().toISOString(),
                approved_at: paymentData.approvedAt,
                receipt_url: paymentData.receipt?.url
            });

        if (paymentError) {
            console.error('Payment DB Error:', paymentError);
            // Payment succeeded at Toss but failed to record? 
            // We should probably log this critically.
        }

        // 4.2 Upsert Subscription
        // Calculate billing cycle based on planId or passed data.
        // Assuming standard monthly for now or derived from planId logic (which we don't have strictly here, but let's assume monthly for MVP)
        const billingCycle = 'monthly'; // Defaulting
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                plan_id: planId,
                status: 'active',
                billing_cycle: billingCycle,
                current_period_start: startDate.toISOString(),
                current_period_end: endDate.toISOString(),
                payment_key: paymentKey // Save for recurring later
            }, { onConflict: 'user_id' }); // Assuming one sub per user

        if (subError) {
            console.error('Subscription DB Error:', subError);
        }

        return NextResponse.json({ success: true, data: paymentData });

    } catch (error: any) {
        console.error('Payment Confirmation Error:', error);

        if (error instanceof TossPaymentError) {
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
