import Groq from "groq-sdk";
import { ATS_SYSTEM_PROMPT } from "../lib/prompts.js";
import pdfParse from "pdf-parse";

let ai = null;
if (process.env.GROQ_API_KEY) {
  // Initialize Groq client
  ai = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

    // If no API key, return mock response for testing UI
    if (!ai) {
      console.warn("GROQ_API_KEY is not set. Returning mock ATS evaluation.");
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

    // Extract text from PDF buffer safely
    const pdfData = await pdfParse(resumeFile.buffer);
    const resumeText = pdfData.text;

    // Call Groq API
    const chatCompletion = await ai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: ATS_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION TEXT:\n${jobDescription}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const resultText = chatCompletion.choices[0]?.message?.content || "{}";
    const parsedResult = JSON.parse(resultText);

    res.status(200).json(parsedResult);
  } catch (error) {
    console.error("Error in evaluateCandidate:", error);
    const details = error?.message || (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
    res.status(500).json({ error: "Failed to evaluate candidate", details });
  }
};
