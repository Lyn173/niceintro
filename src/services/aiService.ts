import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface VideoData {
  base64: string;
  mimeType: string;
}

export async function generateTikTokScript(
  sampleVideo: VideoData,
  targetVideo: VideoData
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
    You are a viral TikTok content creator specializing in real estate and room tours in Vietnam.
    
    I have provided two videos:
    1. **Sample Video**: This video has a specific voiceover style, slang, and structure. Analyze its tone, catchphrases (like "Chào các con vợ", "mò kim đáy bể", "thoáng như penthouse"), and how it describes the room's features and "feng shui".
    2. **Target Video**: This is a silent video of a different rental room that needs a script.
    
    **Your Task**: Write a new introduction script (in Vietnamese) for the **Target Video**.
    
    **Guidelines**:
    - **Mimic the Vibe**: Use the same high-energy, informal, and humorous tone as the Sample Video.
    - **Slang & Catchphrases**: Incorporate viral TikTok slang and catchphrases similar to the ones in the sample, but adapt them to the content of the Target Video.
    - **Accurate Description**: Describe the actual features visible in the Target Video (e.g., the view, the light, the furniture, the bathroom layout).
    - **Spam Prevention**: Slightly vary the phrasing from the original sample's script so it's not a direct copy-paste, ensuring it passes social media spam filters.
    - **Structure**: Follow a similar flow: Hook/Greeting -> Price/Location context -> Feature highlights -> Humorous/Personal observation -> Closing.
    - **Output**: Provide only the script text, ready to be used as subtitles or a voiceover script.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: sampleVideo.base64,
              mimeType: sampleVideo.mimeType,
            },
          },
          {
            inlineData: {
              data: targetVideo.base64,
              mimeType: targetVideo.mimeType,
            },
          },
        ],
      },
    ],
  });

  return response.text || "Could not generate script. Please try again.";
}
