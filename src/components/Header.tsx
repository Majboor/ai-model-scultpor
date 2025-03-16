
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Settings, Share2, CreditCard, LogIn, LogOut, User, Sparkles, Badge } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Badge as UIBadge } from "@/components/ui/badge";

interface HeaderProps {
  onPricingClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPricingClick }) => {
  const { user, isSubscribed, signOut } = useAuth();
  const needsSubscription = !isSubscribed && user;
  
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-border animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-md">
          <div className="h-4 w-4 bg-white rounded-sm transform rotate-45"></div>
        </div>
        <h1 className="text-2xl font-medium">
          <span className="text-gradient">AI</span> Model Creator
        </h1>
        {isSubscribed && (
          <UIBadge variant="default" className="bg-gradient-to-r from-primary to-blue-400 px-2 py-1 ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium
          </UIBadge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Button 
              variant={needsSubscription ? "default" : "outline"}
              size="sm" 
              className={needsSubscription ? "bg-primary text-white hover:bg-primary/90" : "glass-button"}
              onClick={onPricingClick}
            >
              {isSubscribed ? (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Premium Active
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pricing
                  {needsSubscription && <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">1/1</span>}
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="glass-button">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="glass-button">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link to="/account">
              <Button 
                variant="outline" 
                size="sm" 
                className={`rounded-full p-2 ${isSubscribed ? "border-primary/50 bg-primary/10" : "glass-button"}`}
              >
                {isSubscribed ? (
                  <Badge className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="glass-button" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm" className="glass-button">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
