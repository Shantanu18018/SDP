import { GoogleGenAI } from "@google/genai";
import PDFParser from "pdf2json";


import { ATS_SYSTEM_PROMPT } from "../lib/prompts.js";

let ai = null;
if (process.env.GEMINI_API_KEY) {
  // Sanitize API key to remove invisible unicode characters (like U+202C) copied from web dashboards
  const sanitizedKey = process.env.GEMINI_API_KEY.replace(/[^\x20-\x7E]/g, '');
  ai = new GoogleGenAI({ apiKey: sanitizedKey });
}

export const evaluateCandidate = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume PDF is required." });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required." });
    }

    // Extract text from PDF
    const resumeText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(resumeFile.buffer);
    });

    // If no API key, return mock response for testing UI
    if (!ai) {
      console.warn("GEMINI_API_KEY is not set. Returning mock ATS evaluation.");
      return res.status(200).json({
        candidate_name: "Mock Candidate",
        job_title_applied: "Software Engineer",
        ats_score: { 
          score: 85, 
          label: "Good", 
          reasoning: "The resume shows strong alignment with the core requirements but lacks some specific cloud experience." 
        },
        job_fit: { 
          score: 80, 
          label: "Strong Fit", 
          reasoning: "Overall solid match for the role, with good background in full-stack development." 
        },
        expertise_areas: [
          { area: "Frontend Development", level: "Advanced", evidence: "Built complex React applications with state management." },
          { area: "Backend APIs", level: "Intermediate", evidence: "Designed and implemented RESTful Node.js APIs." }
        ],
        matched_skills: ["React", "Node.js", "JavaScript", "HTML", "CSS"],
        missing_skills: ["AWS", "Docker", "Kubernetes"],
        bonus_skills: ["GraphQL"],
        experience_summary: {
          total_years: 4,
          roles: [
            { title: "Software Engineer", company: "Tech Innovations Inc.", duration: "Jan 2021 – Present" },
            { title: "Junior Developer", company: "Web Solutions", duration: "Jun 2019 – Dec 2020" }
          ]
        },
        education: [
          { degree: "B.S. Computer Science", institution: "State University", year: "2019" }
        ],
        key_projects: [
          { title: "E-commerce Platform Refactor", relevance_to_jd: "High", summary: "Led the migration from a monolith to microservices." },
          { title: "Internal Dashboard", relevance_to_jd: "Medium", summary: "Built an internal analytics tool using React." }
        ],
        red_flags: ["Gap in employment between 2020 and 2021"],
        suggested_interview_questions: [
          "Can you describe your experience with microservices architecture?",
          "How do you handle state management in large React applications?",
          "Tell me about a time you had to learn a new technology quickly."
        ],
        interviewer_verdict: "Strong candidate with a good foundation. We should definitely proceed to the technical interview round, focusing on their backend architecture experience."
      });
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION TEXT:\n${jobDescription}` }
          ]
        }
      ],
      config: {
        systemInstruction: ATS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    let resultText = response.text;
    resultText = resultText.replace(/```json\n?|```/g, '').trim();
    const parsedResult = JSON.parse(resultText);

    res.status(200).json(parsedResult);
  } catch (error) {
    console.error("Error in evaluateCandidate:", error);
    const details = error?.message || (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
    res.status(500).json({ error: "Failed to evaluate candidate", details });
  }
};
