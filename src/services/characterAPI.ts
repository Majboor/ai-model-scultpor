
// Character Generation API service

// Base URL for the Character Generation API
const BASE_URL = 'https://character.techrealm.online';

// Interface for the image generation request
interface ImageGenerationRequest {
  name: string;
  description: string;
  color: string;
}

// Interface for the image generation response
interface ImageGenerationResponse {
  image_url: string;
  local_url: string;
}

// Interface for the model generation request
interface ModelGenerationRequest {
  image_url: string;
}

// Interface for the model generation response
export interface ModelGenerationResponse {
  model_url: string;
  viewer_url: string;
  color_video: string;
  gaussian_ply: string;
}

/**
 * Generate a character image based on provided details
 */
export const generateCharacterImage = async (
  name: string,
  description: string,
  color: string
): Promise<ImageGenerationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/generate/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        color,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating image: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating character image:', error);
    throw error;
  }
};

/**
 * Generate a 3D model from a character image
 */
export const generateCharacterModel = async (
  imageUrl: string
): Promise<ModelGenerationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/generate/model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating model: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating 3D model:', error);
    throw error;
  }
};
