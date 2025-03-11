
// Payment API service

/**
 * Interface for payment creation request
 */
interface CreatePaymentRequest {
  amount: number;
}

/**
 * Interface for payment response
 */
export interface PaymentResponse {
  payment_link: string;
  reference: string;
}

/**
 * Create a payment for subscription
 */
export const createPayment = async (amount: number): Promise<PaymentResponse> => {
  try {
    const response = await fetch('https://pay.techrealm.pk/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error creating payment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};
