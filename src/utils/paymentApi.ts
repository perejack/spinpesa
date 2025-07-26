// paymentApi.ts - Handles STK push initiation from frontend

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    externalReference: string;
    checkoutRequestId: string;
  };
  error?: any;
}

export async function initiateStkPush(phoneNumber: string, amount: number): Promise<PaymentResponse> {
  try {
    const response = await fetch('/.netlify/functions/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, amount }),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
      error,
    };
  }
}
