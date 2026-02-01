export async function getPlacementSuggestions(studentProfile: any, drives: any[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return "AI suggestions are currently unavailable. Please set up the OpenRouter API key in .env.local.";
  }

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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter analytics
        "X-Title": "Campus Placement System", // Optional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter API Error Details:", JSON.stringify(data.error, null, 2));
      return `AI Error: ${data.error.message || "Please check your API key and balance."}`;
    }

    return data.choices?.[0]?.message?.content || "No suggestions available at the moment.";
  } catch (error) {
    console.error("OpenRouter AI Error:", error);
    return "Failed to connect to AI service. Please check your internet connection.";
  }
}
