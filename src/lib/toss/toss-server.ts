export class TossPaymentError extends Error {
    code: string;

    constructor(code: string, message: string) {
        super(message);
        this.code = code;
    }
}

interface ConfirmPaymentRequest {
    paymentKey: string;
    orderId: string;
    amount: number;
}

export async function confirmPayment(request: ConfirmPaymentRequest) {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
        throw new Error('TOSS_SECRET_KEY is not defined');
    }

    // Basic Auth: base64(SECRET_KEY + ':')
    const basicAuth = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new TossPaymentError(json.code, json.message);
    }

    return json;
}

// Function to get payment information (for verification if needed)
export async function getPaymentByOrderId(orderId: string) {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
        throw new Error('TOSS_SECRET_KEY is not defined');
    }

    const basicAuth = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch(`https://api.tosspayments.com/v1/payments/orders/${orderId}`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
        },
    });

    const json = await response.json();

    if (!response.ok) {
        throw new TossPaymentError(json.code, json.message);
    }

    return json;
}
