import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const processVirtualTryOn = async (
  personImage: ImageData,
  clothingImage: ImageData,
  customPrompt: string = ""
): Promise<string> => {
  // Görsel işleme modelleri için v1beta API sürümü gereklidir
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY,
    apiVersion: 'v1beta'
  });
  
  const instructionText = `TASK: Virtual Try-On. 
  Take the garment from the second image and realistically place it on the person in the first image.
  - Maintain the person's pose, face, and background exactly.
  - Blend the clothing naturally with lighting and body shape.
  - User notes: ${customPrompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: personImage.base64,
            mimeType: personImage.mimeType,
          },
        },
        {
          inlineData: {
            data: clothingImage.base64,
            mimeType: clothingImage.mimeType,
          },
        },
        { text: instructionText },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  
  if (!part?.inlineData) {
    throw new Error("Görsel üretilemedi. API anahtarınızın bu modele (v1beta) yetkisi olduğundan emin olun.");
  }

  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const editImageWithPrompt = async (
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.API_KEY,
    apiVersion: 'v1beta'
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: baseImage.base64,
            mimeType: baseImage.mimeType,
          },
        },
        { text: `Modify this image exactly as described: ${prompt}. Return ONLY the final resulting image.` },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  
  if (!part?.inlineData) {
    throw new Error("Görsel düzenlenemedi.");
  }

  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};