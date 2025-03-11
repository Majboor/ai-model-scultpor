
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";

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
        
        <DialogFooter className="sm:justify-start">
          {paymentLink ? (
            <div className="w-full">
              <Button 
                className="w-full mb-2" 
                onClick={() => window.open(paymentLink, '_blank')}
              >
                Proceed to Payment
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to our secure payment processor
              </p>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={onSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Subscribe for $14/month"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
