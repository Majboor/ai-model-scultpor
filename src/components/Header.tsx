
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Settings, Share2, CreditCard } from "lucide-react";
import { hasUsedFreeTrial, checkSubscriptionStatus } from '@/services/paymentAPI';

interface HeaderProps {
  onPricingClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPricingClick }) => {
  const hasUnlockedPro = checkSubscriptionStatus();
  const needsSubscription = hasUsedFreeTrial() && !hasUnlockedPro;
  
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-border animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-md">
          <div className="h-4 w-4 bg-white rounded-sm transform rotate-45"></div>
        </div>
        <h1 className="text-2xl font-medium">
          <span className="text-gradient">AI</span> Model Creator
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant={needsSubscription ? "default" : "outline"}
          size="sm" 
          className={needsSubscription ? "bg-primary text-white hover:bg-primary/90" : "glass-button"}
          onClick={onPricingClick}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {hasUnlockedPro ? "Subscribed" : "Pricing"}
          {needsSubscription && <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">1/1</span>}
        </Button>
        <Button variant="outline" size="sm" className="glass-button">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="glass-button">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="glass-button rounded-full p-2">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
