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

function formatPhoneNumber(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '254' + p.slice(1);
  else if (p.startsWith('7')) p = '254' + p;
  else if (!p.startsWith('254')) p = '254' + p;
  return p;
}

export async function initiateStkPush(phoneNumber: string, amount: number): Promise<PaymentResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const response = await fetch('/.netlify/functions/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: formattedPhone, amount }),
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
