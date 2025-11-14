
import { GoogleGenAI, Type } from "@google/genai";
import { Resume, Job, GroundingChunk, JobSearchFilters } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        contactInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
            },
            required: ["name", "email", "phone", "location"],
        },
        summary: {
            type: Type.STRING,
            description: "A professional summary of 2-4 sentences. If not present in the resume, generate one based on the experience.",
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["role", "company", "location", "dates", "description"],
            },
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING },
                },
                 required: ["degree", "institution", "location", "dates"],
            },
        },
        skills: {
            type: Type.OBJECT,
            properties: {
                programming: { type: Type.ARRAY, items: { type: Type.STRING } },
                technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["programming", "technical", "languages"],
        },
    },
    required: ["contactInfo", "summary", "experience", "education", "skills"],
};

export async function parseResumeAPI(mimeType: string, imageBase64: string): Promise<Resume> {
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: imageBase64,
    },
  };
  const textPart = {
    text: "Parse the provided resume image and extract the information into a structured JSON format. Act as an expert HR professional. Ensure all fields in the schema are populated accurately.",
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [textPart, imagePart] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
    }
  });

  const parsedJson = JSON.parse(response.text);
  return parsedJson as Resume;
}


const jobsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique ID for the job posting."},
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING, description: "A detailed job description of 3-5 sentences."},
            url: { type: Type.STRING, description: "The direct URL to the job posting."},
            relevanceScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating how relevant this job is to the resume." },
            visaSponsorship: { type: Type.BOOLEAN, description: "Whether the company is known to sponsor visas for this role. Set to true if visa sponsorship is mentioned or likely, otherwise false."},
            experienceLevel: { type: Type.STRING, description: "The experience level required for the job (e.g., Entry-level, Mid-level, Senior)."}
        },
        required: ["id", "title", "company", "location", "description", "url", "relevanceScore", "visaSponsorship", "experienceLevel"]
    }
};

export async function findJobsAPI(resume: Resume, filters: JobSearchFilters): Promise<{ jobs: Job[], sources: GroundingChunk[] }> {
    let prompt = `Based on this resume JSON, act as an expert recruiter. Use Google Search to find 8 currently open, real job postings suitable for this candidate. Search for roles like Data Scientist, Business Intelligence Engineer, and Data Analyst on job boards like LinkedIn, Greenhouse, or Indeed. Provide a diverse list from major tech companies.`;
    
    // Add filters to the prompt
    if (filters.experienceLevel && filters.experienceLevel !== 'Any') {
        prompt += `\nThe job must be at the ${filters.experienceLevel} level.`;
    }
    if (filters.country) {
        prompt += `\nThe jobs must be located in ${filters.country}.`;
    }
    if (filters.isRemote) {
        prompt += `\nThe job must be fully remote (work from anywhere).`;
    }
    if (filters.visaSponsorship) {
        prompt += `\nCRITICAL: The company must offer visa sponsorship for international candidates. Use Google Search to verify this from the job posting, the company's career page, or other reliable online sources. Only include jobs where visa sponsorship is explicitly mentioned or highly probable.`;
    }

    prompt += `\n\nIMPORTANT: Respond with ONLY a valid JSON array that conforms to the following schema. Do not include any other text, markdown, or explanations before or after the JSON.
    
Schema:
${JSON.stringify(jobsSchema, null, 2)}
    
Resume:
${JSON.stringify(resume, null, 2)}`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
    const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let jobs: Job[] = [];
    try {
      jobs = JSON.parse(cleanedText) as Job[];
    } catch (e) {
      console.error("Failed to parse jobs JSON:", e);
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          jobs = JSON.parse(jsonMatch[0]) as Job[];
        } catch (e2) {
          console.error("Failed to parse extracted jobs JSON:", e2);
          throw new Error("The model returned an invalid JSON format for job listings.");
        }
      } else {
         throw new Error("The model did not return a valid JSON array for job listings.");
      }
    }
  
    const sortedJobs = jobs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return { jobs: sortedJobs, sources: (sources as GroundingChunk[]) };
}

export async function generateCoverLetterSnippetAPI(resume: Resume, job: Job): Promise<string> {
    const prompt = `You are a career coach. Based on the candidate's resume and this job description, write a compelling, concise, and professional two-sentence opening for a cover letter. This snippet will be used for an 'auto-apply' feature, so it must be impactful and highlight the most relevant skills and experience.

Candidate's Resume:
${JSON.stringify(resume, null, 2)}

Job Posting:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
}

export async function generateFollowUpAPI(job: Job): Promise<string> {
    const prompt = `You are a professional communication assistant. Write a polite, concise, and professional follow-up email regarding a job application. The email should be sent about a week after applying.

Job Details:
- Position: ${job.title}
- Company: ${job.company}

Generate only the body of the email. Start with a professional greeting (e.g., "Dear [Hiring Manager name] or Hiring Team,") and end with a professional closing (e.g., "Sincerely,\n[Your Name]").`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
}