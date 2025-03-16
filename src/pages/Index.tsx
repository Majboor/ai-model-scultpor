import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ModelViewer from '@/components/ModelViewer';
import ModelGallery, { Model } from '@/components/ModelGallery';
import PricingSection from '@/components/PricingSection';
import SubscriptionModal from '@/components/SubscriptionModal';
import { saveModel, getSampleModels } from '@/utils/modelUtils';
import { useToast } from "@/hooks/use-toast";
import { generateCharacterImage, generateCharacterModel, ModelGenerationResponse } from '@/services/characterAPI';
import { 
  createPayment, 
  PaymentResponse, 
  hasUsedFreeTrial, 
  recordFreeTrialUsage 
} from '@/services/paymentAPI';
import { Sparkles, ArrowRight, Cuboid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  // State for API steps
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterColor, setCharacterColor] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);
  const [currentModelData, setCurrentModelData] = useState<ModelGenerationResponse | undefined>(undefined);
  const [models, setModels] = useState<Model[]>(getSampleModels());
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Usage limit and subscription state
  const [hasUsedFreeGeneration, setHasUsedFreeGeneration] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  
  // Authentication context
  const { user, isSubscribed, checkSubscription } = useAuth();
  const navigate = useNavigate();
  
  // Add state for login prompt modal
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Check free trial status when user changes
  useEffect(() => {
    const checkFreeTrialStatus = async () => {
      if (user) {
        const trialUsed = await hasUsedFreeTrial();
        setHasUsedFreeGeneration(trialUsed);
      } else {
        // Reset state when not logged in
        setHasUsedFreeGeneration(false);
      }
      
      // Check for subscription in auth context
      if (user) {
        checkSubscription();
      }
    };
    
    checkFreeTrialStatus();
  }, [user, checkSubscription]);

  // Function to check authentication before performing actions
  const checkAuthentication = () => {
    if (!user) {
      setIsLoginPromptOpen(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature.",
      });
      return false;
    }
    return true;
  };
  
  // Enhanced function to check usage limits
  const checkUsageLimit = async () => {
    // If user is subscribed, they have unlimited access
    if (isSubscribed) return true;
    
    // For non-subscribed logged-in users, check if they've used their free trial
    if (user) {
      const trialUsed = await hasUsedFreeTrial();
      
      if (trialUsed) {
        setIsSubscriptionModalOpen(true);
        toast({
          title: "Free trial used",
          description: "You've used your free character generation. Subscribe to create more!",
        });
        return false;
      }
    }
    
    return true;
  };
  
  // Function to handle redirect to login
  const handleRedirectToLogin = () => {
    setIsLoginPromptOpen(false);
    navigate('/auth');
  };

  // Step 1: Generate character image
  const handleGenerateImage = async (name: string, description: string, color: string) => {
    // Check if user is authenticated
    if (!checkAuthentication()) {
      return;
    }
    
    // Check usage limits
    if (!await checkUsageLimit()) {
      return;
    }
    
    setCharacterName(name);
    setCharacterDescription(description);
    setCharacterColor(color);
    setIsGeneratingImage(true);
    
    try {
      const imageData = await generateCharacterImage(name, description, color);
      setGeneratedImageUrl(imageData.image_url);
      
      // Increment usage count for non-subscribed users
      if (!isSubscribed) {
        await recordFreeTrialUsage();
        setHasUsedFreeGeneration(true);
      }
      
      toast({
        title: "Image generated successfully",
        description: "You can now create a 3D model or regenerate the image.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate image",
        description: "There was an error generating your character image. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Step 2: Generate 3D model from the image
  const handleCreateModel = async () => {
    // Check if user is authenticated
    if (!checkAuthentication()) {
      return;
    }
    
    if (!generatedImageUrl) {
      toast({
        title: "No image available",
        description: "Please generate a character image first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingModel(true);
    
    try {
      const modelData = await generateCharacterModel(generatedImageUrl);
      setCurrentModelData(modelData);
      setCurrentModel(modelData.model_url);
      setViewerUrl(modelData.viewer_url);
      
      // Save the generated model to the user's collection
      const newModel = saveModel(characterName, generatedImageUrl, modelData);
      setModels([newModel, ...models]);
      
      toast({
        title: "Model generated successfully",
        description: "Your 3D model has been added to your gallery.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate model",
        description: "There was an error generating your 3D model. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating model:", error);
    } finally {
      setIsGeneratingModel(false);
    }
  };
  
  // Handle regenerating the image
  const handleRegenerateImage = () => {
    // Check if user is authenticated
    if (!checkAuthentication()) {
      return;
    }
    
    // Check usage limits for regeneration
    if (!checkUsageLimit()) {
      return;
    }
    
    // Reset image and model data
    setGeneratedImageUrl(undefined);
    setCurrentModel(undefined);
    setCurrentModelData(undefined);
    
    // Re-trigger image generation with the same parameters
    if (characterName && characterDescription && characterColor) {
      handleGenerateImage(characterName, characterDescription, characterColor);
    }
  };
  
  const handleSelectModel = (id: string) => {
    // Check if user is authenticated
    if (!checkAuthentication()) {
      return;
    }
    
    const model = models.find(m => m.id === id);
    if (model) {
      setCurrentModel(model.modelUrl);
      setGeneratedImageUrl(model.thumbnail);
      setViewerUrl(model.viewerUrl);
      
      toast({
        title: model.name,
        description: "Model loaded successfully.",
      });
    }
  };

  // Handle subscription process
  const handleSubscribe = async () => {
    if (!user) {
      setIsLoginPromptOpen(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
      });
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentLink(null);
    
    try {
      const paymentData = await createPayment();
      setPaymentLink(paymentData.payment_url);
      
      toast({
        title: "Payment processing",
        description: "You'll be redirected to complete your subscription payment.",
      });
    } catch (error) {
      toast({
        title: "Payment processing error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      console.error("Error processing payment:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // When user clicks on a Get Started button - scroll to prompt input
  const scrollToPromptInput = () => {
    document.getElementById('prompt-input')?.scrollIntoView({ behavior: 'smooth' });
  };

  // When user clicks on the Pricing button in header - scroll to pricing section
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Determine if the user can still use the free trial
  const canUseFreeGeneration = isSubscribed || (!user || !hasUsedFreeGeneration);

  return (
    <div className="min-h-screen bg-background">
      <Header onPricingClick={scrollToPricing} />
      
      <main className="page-container">
        {/* Hero Section */}
        <div className="py-10 sm:py-16 mb-8 animate-fade-in">
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-block px-4 py-1 bg-primary/10 backdrop-blur-sm rounded-full text-primary font-medium text-sm mb-2">
                    <Sparkles className="h-4 w-4 inline-block mr-2" />
                    AI-Powered 3D Character Generation
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    <span className="text-gradient">Create amazing</span><br />
                    3D characters instantly
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Transform your ideas into stunning 3D models with just a few clicks.
                    No design skills required!
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Button size="lg" className="bg-primary text-white hover:bg-primary/90 clickable" onClick={scrollToPromptInput}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="glass-button clickable" onClick={scrollToPricing}>
                      View Pricing
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl animate-pulse-subtle"></div>
                  <div className="relative rounded-xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/10">
                    <img 
                      src="https://i.ibb.co/gTDZZT8/hero-character.png" 
                      alt="Example 3D Character" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div id="prompt-input">
            <PromptInput 
              onGenerate={handleGenerateImage} 
              isGenerating={isGeneratingImage || isGeneratingModel}
              canGenerate={canUseFreeGeneration}
            />
            
            {user && !isSubscribed && hasUsedFreeGeneration && (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Free trial used</h3>
                    <p className="text-sm text-muted-foreground">Subscribe to create unlimited characters</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <ModelViewer 
            modelUrl={currentModel} 
            imageUrl={generatedImageUrl}
            viewerUrl={viewerUrl}
            isLoading={false}
            isGeneratingImage={isGeneratingImage}
            isGeneratingModel={isGeneratingModel}
            onRegenerateImage={handleRegenerateImage}
            onCreateModel={handleCreateModel}
          />
          
          <ModelGallery 
            models={models} 
            onSelectModel={handleSelectModel} 
          />
          
          <PricingSection
            onSubscribe={() => setIsSubscriptionModalOpen(true)}
            isProcessing={isProcessingPayment}
          />
        </div>
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        paymentLink={paymentLink}
        isProcessing={isProcessingPayment}
        onSubscribe={handleSubscribe}
      />
      
      {/* Login Prompt Modal */}
      <Dialog
        open={isLoginPromptOpen}
        onOpenChange={setIsLoginPromptOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to use this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsLoginPromptOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRedirectToLogin}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
