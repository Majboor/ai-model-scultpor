
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hasUsedFreeTrial } from "@/services/paymentAPI";
import { useAuth } from '@/context/AuthContext';

interface PromptInputProps {
  onGenerate: (name: string, description: string, color: string) => void;
  isGenerating: boolean;
  canGenerate?: boolean; // New prop to control if generation is allowed
}

const PromptInput: React.FC<PromptInputProps> = ({ 
  onGenerate, 
  isGenerating,
  canGenerate = true // Default to true if not specified
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [canUseFreeTrial, setCanUseFreeTrial] = useState(true);
  const { toast } = useToast();
  const { user, isSubscribed } = useAuth();

  // Check if user has used their free trial
  useEffect(() => {
    const checkFreeTrialStatus = async () => {
      if (user) {
        const hasUsed = await hasUsedFreeTrial();
        setCanUseFreeTrial(!hasUsed);
      } else {
        setCanUseFreeTrial(true); // Always allow if not logged in (will prompt to login)
      }
    };
    
    checkFreeTrialStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user can't generate due to subscription limitations
    if (!canGenerate || (user && !canUseFreeTrial && !isSubscribed)) {
      toast({
        title: "Usage limit reached",
        description: "You've used your free character generation. Subscribe to create more!",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Empty description",
        description: "Please enter a description for your character.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Empty name",
        description: "Please enter a name for your character.",
        variant: "destructive",
      });
      return;
    }
    
    onGenerate(name, description, color);
  };

  const colorOptions = [
    { name: 'Blue', value: 'blue' },
    { name: 'Red', value: 'red' },
    { name: 'Green', value: 'green' },
    { name: 'Purple', value: 'purple' },
    { name: 'Orange', value: 'orange' },
  ];

  // Determine if the user can generate based on subscription and free trial
  // Changed this logic to allow input fields to be editable even if canGenerate is false
  // Only the submission button should be disabled
  const userCanSubmit = canGenerate && (isSubscribed || canUseFreeTrial || !user);

  return (
    <div className="w-full animate-fade-in">
      <div className="rounded-2xl glass-card p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Create your 3D character</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Describe your character in detail and our AI will generate it for you.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Character Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your character..."
              className="input-focus-ring w-full"
              disabled={isGenerating}
            />
          </div>

          <div className="mt-2">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description of your character..."
              className="input-focus-ring w-full"
              disabled={isGenerating}
            />
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption.value ? 'border-white ring-2 ring-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  disabled={isGenerating}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className={`mt-4 clickable ${!userCanSubmit ? 'bg-muted hover:bg-muted' : 'bg-primary text-white hover:bg-primary/90'}`}
            disabled={isGenerating || !userCanSubmit}
          >
            {!userCanSubmit ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Upgrade to Generate
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Character"}
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <p>Try: "A warrior with glowing armor and cosmic energy"</p>
          <p>{description.length} / 200 characters</p>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
