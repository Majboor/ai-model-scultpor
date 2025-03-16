
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
 * Create a test subscription (no payment required)
 * For testing purposes only
 */
export const createTestSubscription = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found');
      return false;
    }
    
    // Calculate subscription expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Check if user already has a subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing subscription:', fetchError);
      return false;
    }
    
    // If user already has a subscription, update it instead of creating a new one
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          is_active: true,
          payment_reference: 'TEST-' + Date.now(),
          status: 'test',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error updating test subscription:', updateError);
        return false;
      }
    } else {
      // Insert new subscription record if one doesn't exist
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          is_active: true,
          payment_reference: 'TEST-' + Date.now(),
          amount: 0, // $0 for test
          status: 'test',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating test subscription:', insertError);
        return false;
      }
    }
    
    // Update local storage to reflect subscription status
    localStorage.setItem('isSubscribed', 'true');
    
    return true;
  } catch (error) {
    console.error('Error in createTestSubscription:', error);
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
export const hasUsedFreeTrial = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If user is not logged in, fallback to localStorage
      return localStorage.getItem('usageCount') !== null && 
             parseInt(localStorage.getItem('usageCount') || '0', 10) >= 1;
    }

    // Check if user has a subscription record with free_trial_used flag
    const { data, error } = await supabase
      .from('subscriptions')
      .select('free_trial_used')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription record found, user hasn't used free trial
        return false;
      }
      console.error('Error checking free trial status:', error);
      // Fallback to localStorage if there's an error
      return localStorage.getItem('usageCount') !== null && 
             parseInt(localStorage.getItem('usageCount') || '0', 10) >= 1;
    }
    
    return data.free_trial_used;
  } catch (error) {
    console.error('Error in hasUsedFreeTrial:', error);
    // Fallback to localStorage if there's an error
    return localStorage.getItem('usageCount') !== null && 
           parseInt(localStorage.getItem('usageCount') || '0', 10) >= 1;
  }
};

/**
 * Record that the user has used their free trial
 */
export const recordFreeTrialUsage = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // If user is not logged in, fallback to localStorage
      const currentUsage = parseInt(localStorage.getItem('usageCount') || '0', 10);
      const newUsage = currentUsage + 1;
      localStorage.setItem('usageCount', newUsage.toString());
      return newUsage;
    }
    
    // Check if user already has a subscription record
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking subscription record:', fetchError);
      // Fallback to localStorage if there's an error
      const currentUsage = parseInt(localStorage.getItem('usageCount') || '0', 10);
      const newUsage = currentUsage + 1;
      localStorage.setItem('usageCount', newUsage.toString());
      return newUsage;
    }
    
    if (existingSubscription) {
      // Update existing subscription record
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          free_trial_used: true,
          presentations_generated: existingSubscription.presentations_generated + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error updating subscription record:', updateError);
      }
      
      return existingSubscription.presentations_generated + 1;
    } else {
      // Create new subscription record
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          free_trial_used: true,
          presentations_generated: 1,
          is_active: false,
          status: 'free'
        });
      
      if (insertError) {
        console.error('Error creating subscription record:', insertError);
      }
      
      return 1;
    }
  } catch (error) {
    console.error('Error in recordFreeTrialUsage:', error);
    // Fallback to localStorage if there's an error
    const currentUsage = parseInt(localStorage.getItem('usageCount') || '0', 10);
    const newUsage = currentUsage + 1;
    localStorage.setItem('usageCount', newUsage.toString());
    return newUsage;
  }
};

/**
 * Reset usage count (for testing)
 */
export const resetUsageCount = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          free_trial_used: false,
          presentations_generated: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error resetting subscription usage:', error);
      }
    }
    
    // Always clear localStorage as a fallback
    localStorage.removeItem('usageCount');
  } catch (error) {
    console.error('Error in resetUsageCount:', error);
    localStorage.removeItem('usageCount');
  }
};
