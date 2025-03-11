
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
  payment_url: string;  // Changed from payment_link to payment_url
  special_reference: string;  // Changed from reference to special_reference
}

/**
 * Create a payment for subscription
 */
export const createPayment = async (): Promise<PaymentResponse> => {
  try {
    // Fixed amount of 5141 (51.41 AED)
    const amount = 5141;
    
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

/**
 * Check if the user has a subscription
 */
export const checkSubscriptionStatus = (): boolean => {
  return localStorage.getItem('isSubscribed') === 'true';
};

/**
 * Check if the user has used their free trial
 */
export const hasUsedFreeTrial = (): boolean => {
  return localStorage.getItem('usageCount') !== null && 
         parseInt(localStorage.getItem('usageCount') || '0', 10) >= 1;
};

/**
 * Record that the user has used their free trial
 */
export const recordFreeTrialUsage = (): number => {
  const currentUsage = parseInt(localStorage.getItem('usageCount') || '0', 10);
  const newUsage = currentUsage + 1;
  localStorage.setItem('usageCount', newUsage.toString());
  return newUsage;
};

/**
 * Reset usage count (for testing)
 */
export const resetUsageCount = (): void => {
  localStorage.setItem('usageCount', '0');
};

