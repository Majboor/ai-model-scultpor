
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Beaker } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { createTestSubscription } from "@/services/paymentAPI";

interface PricingProps {
  onSubscribe: () => void;
  isProcessing: boolean;
}

const PricingSection: React.FC<PricingProps> = ({ onSubscribe, isProcessing }) => {
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isTestProcessing, setIsTestProcessing] = useState(false);

  const handleTestSubscription = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature.",
      });
      navigate('/auth');
      return;
    }
    
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
        
        // Redirect to success page
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
    <div id="pricing" className="w-full py-12 scroll-mt-20 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Pricing Plans</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Choose a plan that works for you and start creating amazing 3D characters today.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="glass-card relative rounded-xl p-6 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Free Plan</h3>
            <div className="text-3xl font-bold mt-2">$0</div>
            <p className="text-muted-foreground mt-2">Get started with basic features</p>
          </div>
          
          <div className="space-y-3 mb-8 flex-grow">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Generate 1 character for free</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Export basic 3D models</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Access to model gallery</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            Current Plan
          </Button>
        </div>

        {/* Premium Plan */}
        <div className="glass-card relative rounded-xl p-6 flex flex-col h-full border-primary/30 shadow-lg shadow-primary/10">
          <div className="absolute -top-3 -right-3">
            <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
              <Sparkles className="h-4 w-4 inline-block mr-1" />
              Recommended
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Starter Package</h3>
            <div className="text-3xl font-bold mt-2">$14 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
            <p className="text-muted-foreground mt-2">Everything you need for unlimited creation</p>
          </div>
          
          <div className="space-y-3 mb-8 flex-grow">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span><span className="text-primary font-semibold">Unlimited</span> character generations</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>High-quality 3D model exports</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Priority processing</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Advanced customization options</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Email support</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={onSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Subscribe Now"}
            </Button>
            
            {user && (
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleTestSubscription}
                disabled={isTestProcessing}
              >
                <Beaker className="mr-2 h-4 w-4 text-amber-500" />
                {isTestProcessing ? "Processing..." : "Test Subscription (No Payment)"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
