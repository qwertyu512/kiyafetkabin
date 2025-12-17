import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const processVirtualTryOn = async (
  personImage: ImageData,
  clothingImage: ImageData,
  customPrompt: string = ""
): Promise<string> => {
  // process.env.API_KEY, build aşamasında vite.config.ts aracılığıyla enjekte edilir.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemPrompt = `You are an expert AI fashion stylist and photorealistic image editor.
  Task: Perform a virtual try-on.
  Inputs: 
  1. A photo of a person.
  2. A photo of a clothing item.
  Instructions:
  - Take the clothing item from the second image and realistically "dress" the person in the first image with it.
  - Maintain the person's exact pose, facial features, and body proportions.
  - Match the lighting and shadows of the original person's photo for a seamless look.
  - The final output must be only the high-quality edited image.
  - If there is any specific instruction: ${customPrompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-rreview-image',
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

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Yapay zeka görseli oluşturamadı. Lütfen daha net fotoğraflar deneyin.");
  return imageUrl;
};

export const editImageWithPrompt = async (
  baseImage: ImageData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

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
        { text: `Edit this image based on the following instruction: ${prompt}. Return the modified image.` },
      ],
    },
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Düzenleme işlemi başarısız oldu.");
  return imageUrl;
};