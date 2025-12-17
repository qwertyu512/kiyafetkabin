import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const processVirtualTryOn = async (
  personImage: ImageData,
  clothingImage: ImageData,
  customPrompt: string = ""
): Promise<string> => {
  // Instance is created inside the function to ensure the freshest API key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemPrompt = `You are a high-end digital fashion editor. 
  Your task is to take the garment from the second image and realistically place it on the person in the first image.
  - Maintain the person's identity, pose, and background exactly.
  - Blend the clothing naturally with lighting and shadows.
  - Ensure high-resolution output.
  - Extra details: ${customPrompt}`;

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
        { text: systemPrompt },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData) {
    throw new Error("Yapay zeka görseli işleyemedi. Lütfen API anahtarınızı ve görsellerinizi kontrol edin.");
  }
  
  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const editImageWithPrompt = async (
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
        { text: `Strictly modify this image based on this request: ${prompt}. Maintain quality and return only the resulting image.` },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part?.inlineData) {
    throw new Error("Düzenleme işlemi sırasında bir hata oluştu.");
  }
  
  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};