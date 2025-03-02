
import React, { useState } from 'react';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import ModelViewer from '@/components/ModelViewer';
import ModelGallery, { Model } from '@/components/ModelGallery';
import { generateModel, getSampleModels, saveModel } from '@/utils/modelUtils';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);
  const [models, setModels] = useState<Model[]>(getSampleModels());
  const { toast } = useToast();

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      // In a real app, this would call an AI service to generate a 3D model
      const modelUrl = await generateModel(prompt);
      
      setCurrentModel(modelUrl);
      
      // Save the generated model to the user's collection
      const newModel = saveModel(prompt, modelUrl);
      setModels([newModel, ...models]);
      
      toast({
        title: "Model generated successfully",
        description: "Your 3D model has been added to your gallery.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate model",
        description: "There was an error generating your model. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating model:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelectModel = (id: string) => {
    const model = models.find(m => m.id === id);
    if (model) {
      setCurrentModel(model.thumbnail);
      
      toast({
        title: model.name,
        description: "Model loaded successfully.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container">
        <div className="grid grid-cols-1 gap-6">
          <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
          
          <ModelViewer 
            modelUrl={currentModel} 
            isLoading={isGenerating} 
          />
          
          <ModelGallery 
            models={models} 
            onSelectModel={handleSelectModel} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
