import { Candidate, JobCriteria } from '../types';

// In a real app, these would be API calls to your Backend (Node/Python) -> MongoDB
// Example: return axios.post('/api/candidates/upload', formData);

const MOCK_SKILLS_POOL = ["React", "Node.js", "TypeScript", "Python", "Java", "AWS", "Docker", "Figma", "SQL", "Tailwind", "Next.js", "Redux", "MongoDB", "PostgreSQL", "Kubernetes"];

// Simulate a backend parsing a PDF/Doc and saving to MongoDB
export const uploadAndSaveCV = async (file: File, jobId: string): Promise<Candidate> => {
  return new Promise((resolve) => {
    // Create a local blob URL for the file to display in the UI
    const resumeUrl = URL.createObjectURL(file);
    
    setTimeout(() => {
      // 1. SIMULATE PARSING (Text Extraction)
      // In production, this happens on the server using pdf-parse or textract
      // Basic heuristic: infer skills from filename tokens
      const fileNameLower = file.name.toLowerCase();
      const tokens = fileNameLower
        .replace(/[_-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      const inferredSkills = MOCK_SKILLS_POOL.filter(s => tokens.some(t => s.toLowerCase().includes(t) || t.includes(s.toLowerCase())));
      const randomSkills = Array.from({ length: 4 }, () => MOCK_SKILLS_POOL[Math.floor(Math.random() * MOCK_SKILLS_POOL.length)]);
      const skills = [...new Set([...randomSkills, ...inferredSkills])];
      
      // Use filename as the name (removing extension)
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      // 2. SIMULATE SAVING TO MONGODB
      // We create a new Candidate object that would be stored in the DB
      const years = Math.max(1, Math.min(12, Math.round(Math.random() * 10)));
      const seniorityGuess = years >= 8 ? "Senior" : years >= 4 ? "Mid-Level" : "Junior";

      const newCandidate: Candidate = {
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileNameWithoutExt, // Directly use filename as requested
        email: `${fileNameWithoutExt.toLowerCase().replace(' ', '.').slice(0, 15)}@example.com`,
        phone: "+1 555-0199",
        location: Math.random() > 0.5 ? "Remote" : "Ho Chi Minh City",
        appliedDate: new Date().toISOString().split('T')[0],
        skills,
        experiences: [
          {
            role: `${seniorityGuess} Software Engineer`,
            company: "Tech Corp",
            duration: `${years} years`,
            description: "Developed scalable web applications, collaborated across teams, and managed cloud infrastructure."
          }
        ],
        matchScore: 0, // Will be calculated by the frontend engine immediately after
        matchLevel: 'Low',
        matchedSkills: [],
        missingSkills: [],
        explanation: ["New candidate uploaded. Analysis pending criteria check."],
        status: 'New',
        resumeUrl: resumeUrl,
        fileType: file.type,
        desiredSalary: 2000 + Math.round(Math.random() * 3000), // USD/month example
        remoteReady: Math.random() > 0.4
      };

      console.log(`[MongoDB Mock] Saved candidate ${newCandidate.id} for Job ${jobId}`);
      resolve(newCandidate);
    }, 1500); // Simulate network/parsing delay
  });
};

export const fetchCandidatesFromDB = async (jobId: string): Promise<Candidate[]> => {
  // In production: return axios.get(`/api/jobs/${jobId}/candidates`);
  return []; 
};