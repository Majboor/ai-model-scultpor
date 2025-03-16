
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, LogIn, Beaker } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { createTestSubscription } from "@/services/paymentAPI";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentLink: string | null;
  isProcessing: boolean;
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  paymentLink,
  isProcessing,
  onSubscribe
}) => {
  const { user, isSubscribed, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTestProcessing, setIsTestProcessing] = useState(false);

  const handleTestSubscription = async () => {
    if (!user) return;
    
    setIsTestProcessing(true);
    try {
      const success = await createTestSubscription();
      
      if (success) {
        // Refresh subscription status
        await checkSubscription();
        
        toast({
          title: "Test subscription activated",
          description: "You now have full access for 30 days!",
        });
        
        // Close modal and redirect to success page
        onClose();
        navigate('/payment-redirect?success=true&test=true');
      } else {
        toast({
          title: "Error activating test subscription",
          description: "There was a problem activating your test subscription.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Test subscription error:", error);
      toast({
        title: "Error activating test subscription",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to Unlimited Access
          </DialogTitle>
          <DialogDescription>
            You've reached the limit of free character generations. Subscribe to our Starter Package for unlimited access.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Starter Package</p>
              <p className="text-sm text-muted-foreground">Unlimited character generations</p>
            </div>
            <div className="text-lg font-bold">$14/mo</div>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <span>Generate unlimited 3D characters</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <span>Download high-quality 3D models</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>
        
        <DialogFooter className="sm:justify-start flex flex-col gap-2">
          {!user ? (
            <div className="w-full">
              <Button 
                className="w-full mb-2"
                onClick={() => {
                  onClose();
                  navigate('/auth');
                }}
              >
                Sign in to continue
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You need to be signed in to subscribe
              </p>
            </div>
          ) : paymentLink ? (
            <div className="w-full space-y-2">
              <Button 
                className="w-full mb-2" 
                onClick={() => window.open(paymentLink, '_blank')}
              >
                Proceed to Payment
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                className="w-full mb-2" 
                onClick={handleTestSubscription}
                disabled={isTestProcessing}
              >
                <Beaker className="mr-2 h-4 w-4 text-amber-500" />
                Test Subscription (No Payment)
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to our secure payment processor
              </p>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <Button 
                className="w-full" 
                onClick={onSubscribe}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Subscribe for $14/month"}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full" 
                onClick={handleTestSubscription}
                disabled={isTestProcessing}
              >
                <Beaker className="mr-2 h-4 w-4 text-amber-500" />
                Test Subscription (No Payment)
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
