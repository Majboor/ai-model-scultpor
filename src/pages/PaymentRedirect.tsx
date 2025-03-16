
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { verifyPayment } from '@/services/paymentAPI';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const PaymentRedirect = () => {
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('Verifying your payment...');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      if (!user) {
        setMessage('You need to be logged in to verify your payment.');
        setIsVerifying(false);
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
      
      try {
        setIsVerifying(true);
        
        // Get URL parameters from the current URL
        const paymentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const txnResponseCode = urlParams.get('txn_response_code');
        
        if (success === 'true' && txnResponseCode === 'APPROVED') {
          // Verify the payment and update subscription status
          const verified = await verifyPayment(paymentUrl, user.id);
          
          if (verified) {
            // Update subscription status
            await checkSubscription();
            
            toast({
              title: "Payment Successful",
              description: "Your subscription has been activated. Enjoy your premium features!",
            });
            
            // Clean URL and redirect to account page
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/account');
          } else {
            setMessage('Payment verification failed. Please contact support.');
            toast({
              title: "Verification Failed",
              description: "Could not verify your payment. Please contact support.",
              variant: "destructive",
            });
            setTimeout(() => navigate('/account'), 3000);
          }
        } else {
          setMessage('Payment was not successful.');
          toast({
            title: "Payment Unsuccessful",
            description: "Your payment was not completed successfully.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/account'), 3000);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setMessage('An error occurred during verification.');
        toast({
          title: "Verification Error",
          description: "An error occurred while verifying your payment.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/account'), 3000);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAndRedirect();
  }, [user, navigate, checkSubscription, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center">
        {isVerifying ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        ) : null}
        <h1 className="text-2xl font-bold mb-4">Payment Verification</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
      </div>
    </div>
  );
};

export default PaymentRedirect;
