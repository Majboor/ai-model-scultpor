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
  checkSubscriptionStatus, 
  hasUsedFreeTrial, 
  recordFreeTrialUsage 
} from '@/services/paymentAPI';
import { Sparkles, ArrowRight, Cuboid } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [usageCount, setUsageCount] = useState(0);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  // Load saved usage count from localStorage on initial render
  useEffect(() => {
    const savedUsageCount = localStorage.getItem('usageCount');
    if (savedUsageCount) {
      setUsageCount(parseInt(savedUsageCount, 10));
    }
  }, []);

  // Step 1: Generate character image
  const handleGenerateImage = async (name: string, description: string, color: string) => {
    // Check if user has reached the free limit and is not subscribed
    if (hasUsedFreeTrial() && !checkSubscriptionStatus()) {
      setIsSubscriptionModalOpen(true);
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
      if (!checkSubscriptionStatus()) {
        const newCount = recordFreeTrialUsage();
        setUsageCount(newCount);
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
    setIsProcessingPayment(true);
    setPaymentLink(null);
    
    try {
      // 14 USD in AED (approximately 51.41 AED)
      const amountInUSD = 14;
      const amountInAED = Math.round(amountInUSD * 3.6725 * 100) / 100;
      const amountInAEDCents = Math.round(amountInAED * 100);
      
      const paymentData = await createPayment(amountInAEDCents);
      setPaymentLink(paymentData.payment_link);
      
      // Store the payment reference for verification
      localStorage.setItem('pendingPaymentReference', paymentData.reference);
      
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
            />
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
    </div>
  );
};

export default Index;
