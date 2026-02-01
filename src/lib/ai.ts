import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getPlacementSuggestions(studentProfile: any, drives: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI suggestions are currently unavailable. Please set up the Gemini API key.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a placement counselor. Analyze this student profile and suggest which of the listed placement drives they should prioritize and why.
    
    Student Profile:
    - Name: ${studentProfile.name}
    - Branch: ${studentProfile.branch}
    - CGPA: ${studentProfile.cgpa}
    - Skills: ${studentProfile.skills}
    - Backlogs: ${studentProfile.backlogs}
    
    Upcoming Placement Drives:
    ${drives.map(d => `- ${d.name} (${d.role}): Requires ${d.criteria.minCgpa} CGPA, Skills: ${d.criteria.requiredSkills.join(', ')}`).join('\n')}
    
    Instructions:
    1. Identify 2-3 best matches based on skills and eligibility.
    2. Provide a personalized "Career Insight" for this student.
    3. Keep the response concise, encouraging, and formatted with bullet points.
    4. If the student is not eligible for a highly desired drive, suggest what skills they should improve.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Failed to generate AI suggestions at this moment.";
  }
}
