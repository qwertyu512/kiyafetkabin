import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const processVirtualTryOn = async (
  personImage: ImageData,
  clothingImage: ImageData,
  customPrompt: string = ""
): Promise<string> => {
  // Yeni bir instance oluşturarak her seferinde güncel API anahtarını alıyoruz
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const instructionText = `TASK: Virtual Try-On. 
  Take the clothing item from the second image and dress the person in the first image with it. 
  Maintain the person's pose, face, and background exactly. 
  Ensure the clothing fits realistically. 
  Additional user requests: ${customPrompt}`;

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
    throw new Error("Görsel oluşturulamadı. Lütfen API anahtarınızı ve bölgenizi kontrol edin.");
  }

  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};

export const editImageWithPrompt = async (
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        { text: `Edit this image as follows: ${prompt}. Maintain original quality and return only the resulting image.` },
      ],
    },
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  
  if (!part?.inlineData) {
    throw new Error("Düzenleme işlemi başarısız oldu.");
  }

  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
};