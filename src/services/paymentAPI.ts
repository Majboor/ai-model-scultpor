
import { supabase } from '@/integrations/supabase/client';

// Payment API service

/**
 * Interface for payment creation request
 */
interface CreatePaymentRequest {
  amount: number;
  redirection_url?: string;
}

/**
 * Interface for payment response
 */
export interface PaymentResponse {
  payment_url: string;  // The URL for redirection to payment page
  special_reference: string;  // Unique reference for this payment
}

/**
 * Create a payment for subscription
 */
export const createPayment = async (): Promise<PaymentResponse> => {
  try {
    // Fixed amount of 5141 (51.41 AED)
    const amount = 5141;
    
    // Get the current domain for redirection
    const domain = window.location.origin;
    const redirectionUrl = `${domain}/payment-redirect`;
    
    const response = await fetch('https://pay.techrealm.pk/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        redirection_url: redirectionUrl
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
 * Verify payment and update subscription status
 */
export const verifyPayment = async (paymentUrl: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { paymentUrl, userId }
    });

    if (error) {
      console.error('Error verifying payment:', error);
      return false;
    }

    return data.success === true;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

/**
 * Check if the user has a subscription
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    // Check if subscription is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
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
