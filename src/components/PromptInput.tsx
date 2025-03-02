
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your 3D model.",
        variant: "destructive",
      });
      return;
    }
    
    onGenerate(prompt);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="rounded-2xl glass-card p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Create your 3D model</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Describe what you want to create and our AI will generate a 3D model for you.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a detailed description of your 3D model..."
            className="input-focus-ring flex-1"
            disabled={isGenerating}
          />
          <Button 
            type="submit" 
            className="clickable bg-primary text-white hover:bg-primary/90"
            disabled={isGenerating}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? "Creating..." : "Generate Model"}
          </Button>
        </form>
        
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <p>Try: "Modern desk lamp with curved arm"</p>
          <p>{prompt.length} / 200 characters</p>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
