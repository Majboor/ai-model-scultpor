import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPayment } from '@/services/paymentAPI';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Sparkles, Beaker } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PaymentRedirect = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkSubscription } = useAuth();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const successParam = params.get('success');
        const testParam = params.get('test');
        
        if (testParam === 'true') {
          setIsSuccess(true);
          setIsProcessing(false);
          
          toast({
            title: "Test subscription activated",
            description: "You now have full access for 30 days!",
          });
          
          await checkSubscription();
          return;
        }
        
        if (!user) {
          setIsSuccess(false);
          setIsProcessing(false);
          
          toast({
            title: "Authentication required",
            description: "You need to be signed in to verify your payment.",
            variant: "destructive",
          });
          return;
        }

        if (successParam === 'true' && window.location.href) {
          const verified = await verifyPayment(window.location.href, user.id);
          
          setIsSuccess(verified);
          
          if (verified) {
            toast({
              title: "Payment successful",
              description: "Your subscription has been activated successfully!",
            });
            
            await checkSubscription();
          } else {
            toast({
              title: "Payment verification failed",
              description: "There was an issue verifying your payment. Please contact support.",
              variant: "destructive",
            });
          }
        } else {
          setIsSuccess(false);
          
          toast({
            title: "Payment failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setIsSuccess(false);
        
        toast({
          title: "Error processing payment",
          description: "An unexpected error occurred. Please try again or contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [location.search, user, toast, checkSubscription]);

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="glass-card rounded-2xl p-8 text-center">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin">
              <Loader2 className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Processing your payment</h1>
            <p className="text-muted-foreground">Please wait while we verify your payment...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-green-500 animate-bounce-once">
              {location.search.includes('test=true') ? (
                <Beaker className="h-16 w-16" />
              ) : (
                <CheckCircle className="h-16 w-16" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {location.search.includes('test=true') ? 'Test Subscription Activated' : 'Payment Successful'}
            </h1>
            <div className="text-muted-foreground">
              {location.search.includes('test=true') ? (
                <p>Your test subscription has been activated. You now have access to all premium features for 30 days.</p>
              ) : (
                <p>Your subscription has been activated. You now have unlimited access to all premium features.</p>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mt-2">
              <Sparkles className="h-4 w-4" />
              Premium Account
            </div>
            <Button 
              className="mt-6 clickable w-full" 
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-destructive">
              <XCircle className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground">There was a problem processing your payment. Please try again or contact support.</p>
            <div className="flex flex-col gap-2 w-full mt-6">
              <Button 
                className="clickable w-full" 
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
              <Button 
                variant="outline" 
                className="clickable w-full" 
                onClick={() => navigate('/#pricing')}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRedirect;
