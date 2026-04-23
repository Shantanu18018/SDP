import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `RESUME TEXT:\nJohn Doe\nSoftware Engineer\n\nJOB DESCRIPTION TEXT:\nLooking for a Software Engineer` }
          ]
        }
      ],
      config: {
        systemInstruction: "Return JSON { \"test\": \"success\" }",
        responseMimeType: "application/json",
      }
    });

    console.log("Raw response text:", response.text);
    console.log("Type of response.text:", typeof response.text);
    if (typeof response.text === "function") {
        console.log("Function output:", response.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
