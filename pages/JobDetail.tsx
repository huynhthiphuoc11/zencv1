import React, { useState, useRef, useEffect } from 'react';
import { Job, Candidate, ChatMessage, JobCriteria, Experience } from '../types';
import { generateJobCriteria } from '../services/geminiService';
import { uploadAndSaveCV } from '../services/candidateService';
import { 
  Send, Sparkles, Upload, Check, X, Filter, 
  Search, ChevronRight, Loader2, Briefcase, SlidersHorizontal, MapPin, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import CandidateDrawer from './CandidateDrawer';
import { generateCandidateExplanation } from '../services/geminiService';

interface JobDetailProps {
  job: Job;
  onUpdateJob: (updatedJob: Job) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onUpdateJob }) => {
  // CHANGED: Initialized with empty array
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'system', content: `Current criteria: ${JSON.stringify(job.criteria, null, 2)}` },
    { id: '2', role: 'assistant', content: "Hello! Upload your CVs, and I will help you rank them." }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Enhanced Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
    const [minScore, setMinScore] = useState<number>(0);
    const [maxScore, setMaxScore] = useState<number>(100);
    const [minExperience, setMinExperience] = useState<number>(0);
    const [maxExperience, setMaxExperience] = useState<number>(50);
    const [skillFilter, setSkillFilter] = useState('');
    const [excludeSkillFilter, setExcludeSkillFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Shortlisted' | 'Rejected'>('All');
  const [locationFilter, setLocationFilter] = useState('');
    const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
    const [maxDesiredSalary, setMaxDesiredSalary] = useState<number>(999999);
    const [nlQuery, setNlQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'name'>('score');
    // Compare selection state
    const [compareSelectedIds, setCompareSelectedIds] = useState<string[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    // Recalculate scores whenever criteria changes
  useEffect(() => {
    if (candidates.length > 0) {
       setCandidates(prev => scoreCandidates(prev, job.criteria));
    }
  }, [job.criteria]); 

  // Helper to calculate total experience in years from strings like "3 years"
  const getTotalExperience = (experiences: Experience[]) => {
    return (experiences || []).reduce((total, exp) => {
        const match = (exp.duration || '').match(/(\d+(\.\d+)?)/);
        return total + (match ? parseFloat(match[0]) : 0);
    }, 0);
  };

    // Pure function to calculate scores
    // Weights: required skills 50, preferred 20, experience 20, domain 10
    // Candidates with score > 50 are considered 'Potential' for follow-up
    const POTENTIAL_THRESHOLD = 50;
    const scoreCandidates = (currentCandidates: Candidate[], criteria: JobCriteria): Candidate[] => {
     return currentCandidates.map(cand => {
      let score = 0;
      const matched: string[] = [];
      const missing: string[] = [];
      
      // Skills (50%)
      const normalizedCandSkills = (cand.skills || []).map(s => (s || '').toLowerCase());
      const normalizedReqSkills = (criteria.requiredSkills || []).map(s => (s || '').toLowerCase());
      
      let skillsMatchCount = 0;
      normalizedReqSkills.forEach(req => {
        if (normalizedCandSkills.some(cs => cs.includes(req) || req.includes(cs))) {
          skillsMatchCount++;
          const original = (criteria.requiredSkills || []).find(s => (s || '').toLowerCase() === req);
          matched.push(original || req);
        } else {
          const original = (criteria.requiredSkills || []).find(s => (s || '').toLowerCase() === req);
          missing.push(original || req);
        }
      });
      
            const skillScore = normalizedReqSkills.length > 0 ? (skillsMatchCount / normalizedReqSkills.length) * 50 : 50;

            // Preferred skills (20%)
            const normalizedPrefSkills = (criteria.preferredSkills || []).map(s => (s || '').toLowerCase());
            let preferredMatchCount = 0;
            normalizedPrefSkills.forEach(pref => {
                if (normalizedCandSkills.some(cs => cs.includes(pref) || pref.includes(cs))) {
                    preferredMatchCount++;
                }
            });
            const preferredScore = normalizedPrefSkills.length > 0 ? (preferredMatchCount / normalizedPrefSkills.length) * 20 : 0;

      // Experience (30%)
      const seniorityTerm = (criteria.seniority || '').toLowerCase();
      const hasSeniority = (cand.experiences || []).some(e => 
        (e.role || '').toLowerCase().includes(seniorityTerm) || 
        (e.description || '').toLowerCase().includes(seniorityTerm)
      );
            // Experience years matching to minExperienceYears (20%)
            const minYears = Number(criteria.minExperienceYears) || 0;
            const totalYears = getTotalExperience(cand.experiences);
            // Full points if meets/exceeds minYears; partial if within 70% of minYears
            let yearsScore = 0;
            if (minYears <= 0) {
                yearsScore = 20; // no minimum, give full credit
            } else if (totalYears >= minYears) {
                yearsScore = 20;
            } else {
                const ratio = Math.max(0, totalYears / minYears);
                yearsScore = Math.round(ratio * 20);
            }
            // Seniority heuristic bonus: small bump if text contains seniority
            const experienceScore = Math.min(20, yearsScore + (hasSeniority ? 4 : 0));

      // Domain (20%)
      const domainTerm = (criteria.domain || '').toLowerCase();
      const hasDomain = (cand.experiences || []).some(e => (e.description || '').toLowerCase().includes(domainTerm));
    const domainScore = hasDomain ? 10 : 0;

        score = Math.round(skillScore + preferredScore + experienceScore + domainScore);

            const matchLevel = score >= 80 ? 'High' : score > POTENTIAL_THRESHOLD ? 'Potential' : 'Low';

            return {
                ...cand,
                matchScore: score,
                matchLevel,
                matchedSkills: matched,
                missingSkills: missing,
            } as Candidate;
    });
  };

  const updateCandidatesWithScores = (rawCandidates: Candidate[], criteria: JobCriteria) => {
    const scored = scoreCandidates(rawCandidates, criteria);
    setCandidates(scored);
    return scored;
  };

  const handleUpdateStatus = (candidateId: string, newStatus: Candidate['status'], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening drawer
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: newStatus } : c
    ));
  };

    const handleGenerateSummary = async (cand: Candidate) => {
        try {
            const explanation = await generateCandidateExplanation(cand.name || 'Candidate', cand.skills || [], job.criteria);
            setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, explanation } : c));
        } catch (err) {
            console.error('Failed to generate summary', err);
        }
    };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsProcessing(true);

    const criteria = await generateJobCriteria(inputMessage);

    setIsProcessing(false);

        if (criteria) {
            const updatedJob = { ...job, criteria };
            onUpdateJob(updatedJob);

            const newScoredList = updateCandidatesWithScores(candidates, criteria);

            const potentialCount = newScoredList.filter(c => c.matchScore > 50).length;
            const topCandidate = newScoredList.sort((a,b) => b.matchScore - a.matchScore)[0];

            let assistantContent = `I've updated the criteria and filtered the CV database.\n\n• Required Skills: ${(criteria.requiredSkills || []).join(', ')}\n• Seniority: ${criteria.seniority || 'Not specified'}\n\nFound **${potentialCount} potential** candidate(s) (score > 50%).`;

            if (topCandidate && topCandidate.matchScore > 50) {
                const skillMatchText = topCandidate.matchedSkills.length > 0 
                    ? `Matches critical skills: ${topCandidate.matchedSkills.join(', ')}`
                    : 'No direct matches with required skills.';

                const seniorityText = criteria.seniority 
                    ? `Experience relevance: Analyzed for '${criteria.seniority}' level.`
                    : 'Experience level analyzed.';

                assistantContent += `\n\n🏆 Top Candidate: **${topCandidate.name.toUpperCase()}** (Score: **${topCandidate.matchScore}**)\n\nReasoning:\n• ${skillMatchText}\n• ${seniorityText}\n• Overall fit: ${topCandidate.matchLevel} Match`;
            } else if (topCandidate) {
                assistantContent += `\n\nNo candidate exceeded the potential threshold (50%).\nTop candidate (below threshold): **${topCandidate.name.toUpperCase()}** (Score: **${topCandidate.matchScore}**)`;
            }

            const assistantMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: assistantContent
            };
            setMessages(prev => [...prev, assistantMsg]);
      
    } else {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Sorry, I couldn't extract criteria from that. Please try again." 
      }]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const newCandidates: Candidate[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const savedCandidate = await uploadAndSaveCV(file, job.id);
          newCandidates.push(savedCandidate);
        } catch (error) {
          console.error("Failed to upload", file.name, error);
        }
      }

      setIsUploading(false);
      const allCandidates = [...candidates, ...newCandidates];
      updateCandidatesWithScores(allCandidates, job.criteria);
    }
  };

  // Enhanced Filter & Sort Logic
    // Parse simple NL query grammar: token AND token, exp>=N
    const applySmartQuery = (cand: Candidate): boolean => {
        if (!nlQuery.trim()) return true;
        const q = nlQuery.toLowerCase();
        const tokens = q.split(/\s+and\s+/);
        return tokens.every(tok => {
            if (tok.includes('exp>=')) {
                const n = Number(tok.replace('exp>=',''));
                return getTotalExperience(cand.experiences) >= (isNaN(n) ? 0 : n);
            }
            const t = tok.trim();
            return (cand.skills || []).some(s => (s || '').toLowerCase().includes(t)) ||
                         (cand.experiences || []).some(e => (e.description || '').toLowerCase().includes(t) || (e.role || '').toLowerCase().includes(t));
        });
    };

    const filteredCandidates = candidates.filter(cand => {
    // Search
    const matchesSearch = (cand.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (cand.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Score
    const matchesScore = cand.matchScore >= minScore && cand.matchScore <= maxScore;
    
    // Experience
    const totalExp = getTotalExperience(cand.experiences);
    const matchesExperience = totalExp >= minExperience && totalExp <= maxExperience;
    
    // Skill Filter
    const matchesSkill = !skillFilter || 
                         (cand.skills || []).some(s => (s || '').toLowerCase().includes(skillFilter.toLowerCase()));
    const matchesExcludeSkill = !excludeSkillFilter || 
                         !(cand.skills || []).some(s => (s || '').toLowerCase().includes(excludeSkillFilter.toLowerCase()));

    // Status Filter
    const matchesStatus = statusFilter === 'All' || cand.status === statusFilter;

    // Location Filter
    const matchesLocation = !locationFilter || (cand.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchesRemote = !remoteOnly || !!cand.remoteReady;
    const matchesSalary = (cand.desiredSalary ?? 0) <= maxDesiredSalary;
    const matchesSmartQuery = applySmartQuery(cand);
                         
        return matchesSearch && matchesScore && matchesExperience && matchesSkill && matchesExcludeSkill && matchesStatus && matchesLocation && matchesRemote && matchesSalary && matchesSmartQuery;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.matchScore - a.matchScore;
    if (sortBy === 'experience') return getTotalExperience(b.experiences) - getTotalExperience(a.experiences);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const renderMessageContent = (content: string) => {
    return content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
  };

    const toggleCompareSelection = (id: string) => {
        setCompareSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return prev; // limit 3
            return [...prev, id];
        });
    };

    const clearCompareSelection = () => setCompareSelectedIds([]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT PANEL: Chatbot & Context */}
    <div className="w-1/2 min-w-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-slate-900">Screening Assistant</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs text-slate-500">Describe your ideal candidate below.</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.filter(m => m.role !== 'system').map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}>
                    <div className="whitespace-pre-line">{renderMessageContent(msg.content)}</div>
                </div>
                </div>
            ))}
            {isProcessing && (
                <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span className="text-xs text-slate-500">Analysing & filtering database...</span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative">
                    <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="E.g., 'Find candidates with React and 5 years exp'"
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
                    />
                    <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 disabled:opacity-50 transition-colors"
                    >
                    <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Powered by Gemini 2.5
                </div>
            </div>
        </div>
      </div>

      {/* CENTER PANEL: Main Workspace */}
    <div className="w-1/2 flex flex-col overflow-hidden relative">
        {/* Upload & Filters Header */}
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm z-10">
            {/* Upload Area */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isUploading ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-slate-50'
                }`}
            >
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    accept=".pdf,.doc,.docx"
                />
                {isUploading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                        <p className="text-sm font-medium text-primary-700">Parsing and saving to Database...</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <div>
                             <p className="text-sm font-medium text-slate-700">Upload CVs (PDF, DOCX)</p>
                             <p className="text-[10px] text-slate-400">Drag & drop to process</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search candidates..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </button>
                        <button
                            onClick={() => setShowCompareModal(true)}
                            disabled={compareSelectedIds.length < 2 || compareSelectedIds.length > 3}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              compareSelectedIds.length >= 2 && compareSelectedIds.length <= 3 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-slate-500'
                            }`}
                        >
                            Compare ({compareSelectedIds.length})
                        </button>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="score">Sort by AI Score</option>
                            <option value="experience">Sort by Experience</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>

                {/* Enhanced Filter Panel */}
                {showFilters && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="All">All Statuses</option>
                                <option value="New">New</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Min Match Score</label>
                            <select 
                                value={minScore}
                                onChange={(e) => setMinScore(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value={0}>All Scores</option>
                                <option value={60}>Medium Match (&gt; 60%)</option>
                                <option value={80}>High Match (&gt; 80%)</option>
                                <option value={90}>Top Talent (&gt; 90%)</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Min Exp (Years)</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={minExperience}
                                onChange={(e) => setMinExperience(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. 3"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Has Skill</label>
                            <input 
                                type="text" 
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. React"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                            <input 
                                type="text" 
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Remote"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Max Match Score</label>
                            <input 
                                type="number" 
                                min={0}
                                max={100}
                                value={maxScore}
                                onChange={(e) => setMaxScore(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. 100"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Max Exp (Years)</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={maxExperience}
                                onChange={(e) => setMaxExperience(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. 10"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Exclude Skill</label>
                            <input 
                                type="text" 
                                value={excludeSkillFilter}
                                onChange={(e) => setExcludeSkillFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. PHP"
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Remote Only</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
                                <span className="text-xs text-slate-500">Only candidates ready for remote</span>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Max Desired Salary</label>
                            <input 
                                type="number" 
                                min="0" 
                                value={maxDesiredSalary}
                                onChange={(e) => setMaxDesiredSalary(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. 3500"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Smart Query</label>
                            <input 
                                type="text" 
                                value={nlQuery}
                                onChange={(e) => setNlQuery(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. React AND fintech AND exp>=3"
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Result Counter */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
                {(statusFilter !== 'All' || minScore > 0 || minExperience > 0 || skillFilter || locationFilter || excludeSkillFilter || remoteOnly || maxDesiredSalary !== 999999 || maxScore !== 100) && (
                     <button 
                        onClick={() => {
                            setMinScore(0);
                            setMaxScore(100);
                            setMinExperience(0);
                            setMaxExperience(50);
                            setSkillFilter('');
                            setExcludeSkillFilter('');
                            setSearchQuery('');
                            setStatusFilter('All');
                            setLocationFilter('');
                            setRemoteOnly(false);
                            setMaxDesiredSalary(999999);
                            setNlQuery('');
                        }}
                        className="text-primary-600 hover:underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 pb-6">
            <div className="space-y-3">
                {candidates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No Candidates Yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                            Upload resumes (PDF, DOCX) above to populate the database and start the AI screening process.
                        </p>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No candidates match your current AI filters.</p>
                    </div>
                ) : (
                    filteredCandidates.map(cand => (
                        <>
                        <div 
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className={`bg-white p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group ${
                                selectedCandidate?.id === cand.id 
                                ? 'border-primary-500 shadow-md ring-1 ring-primary-500' 
                                : 'border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-md'
                            }`}
                        >
                            {/* Compare selection checkbox */}
                            <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={compareSelectedIds.includes(cand.id)}
                                  onChange={(e) => { e.stopPropagation(); toggleCompareSelection(cand.id); }}
                                />
                            </div>
                            {/* Score Badge */}
                            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg font-bold text-lg ${
                                cand.matchLevel === 'High' ? 'bg-green-100 text-green-700' :
                                cand.matchLevel === 'Potential' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {cand.matchScore}
                                <span className="text-[10px] font-normal opacity-75">/100</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                     <h3 className="font-semibold text-slate-900 truncate">{cand.name}</h3>
                                     {/* Quick Status Badge */}
                                     {cand.status !== 'New' && (
                                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                             cand.status === 'Shortlisted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                         }`}>
                                             {cand.status}
                                         </span>
                                     )}
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {cand.experiences[0]?.role || 'Not specified'}</span>
                                    <span>•</span>
                                    <span>{cand.experiences[0]?.duration || '0y'}</span>
                                    {cand.location && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cand.location}</span>
                                        </>
                                    )}
                                </div>
                                {/* Skills Chips */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {cand.matchedSkills.slice(0, 4).map(skill => (
                                        <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                            <Check className="w-2.5 h-2.5 mr-1" />{skill}
                                        </span>
                                    ))}
                                    {cand.missingSkills.length > 0 && (
                                         <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700">
                                            <X className="w-2.5 h-2.5 mr-1" />{cand.missingSkills.length} missing
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions (Hover) */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => handleUpdateStatus(cand.id, 'Shortlisted', e)}
                                    title="Shortlist"
                                    className={`p-1.5 rounded hover:bg-green-100 hover:text-green-700 ${cand.status === 'Shortlisted' ? 'text-green-600 bg-green-50' : 'text-slate-300'}`}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleUpdateStatus(cand.id, 'Rejected', e)}
                                    title="Reject"
                                    className={`p-1.5 rounded hover:bg-red-100 hover:text-red-700 ${cand.status === 'Rejected' ? 'text-red-600 bg-red-50' : 'text-slate-300'}`}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleGenerateSummary(cand)}
                                    title="Generate AI Summary"
                                    className="p-1.5 rounded hover:bg-blue-100 hover:text-blue-700 text-slate-300"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>
                                                        </div>

                                                        <div className="flex-1" />
                                                        <ChevronRight className="w-5 h-5 text-gray-300" />
                                                </div>
                                                {cand.explanation && cand.explanation.length > 0 && (
                                                    <div className="bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-600">
                                                        <div className="font-semibold text-slate-800 mb-1">AI Summary</div>
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {cand.explanation.slice(0,3).map((line, idx) => (
                                                                <li key={idx}>{line}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                        </>
                    ))
                )}
            </div>
        </div>
      </div>

            {/* Compare Modal */}
            {showCompareModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCompareModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-[90vw] max-w-5xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Compare Candidates</h3>
                            <div className="flex items-center gap-2">
                                <button className="text-sm text-slate-600 underline" onClick={clearCompareSelection}>Clear</button>
                                <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700" onClick={() => setShowCompareModal(false)}>Close</button>
                            </div>
                        </div>
                        {compareSelectedIds.length < 2 ? (
                            <div className="text-slate-500 text-sm">Select 2–3 candidates to compare.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="p-2 text-slate-500">Field</th>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                return <th key={id} className="p-2 font-semibold text-slate-800">{c?.name}</th>;
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="p-2 text-slate-500">Match Score</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                const highlight = c && c.matchScore === Math.max(...compareSelectedIds.map(cid => (candidates.find(x => x.id === cid)?.matchScore ?? 0)));
                                                return <td key={id} className={`p-2 ${highlight ? 'bg-green-50 text-green-700 font-medium' : ''}`}>{c?.matchScore}</td>;
                                            })}
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 text-slate-500">Experience (years)</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                const years = c ? getTotalExperience(c.experiences) : 0;
                                                const maxYears = Math.max(...compareSelectedIds.map(cid => {
                                                    const cc = candidates.find(x => x.id === cid);
                                                    return cc ? getTotalExperience(cc.experiences) : 0;
                                                }));
                                                const highlight = years === maxYears;
                                                return <td key={id} className={`p-2 ${highlight ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>{years}</td>;
                                            })}
                                        </tr>
                                        <tr className="border-t align-top">
                                            <td className="p-2 text-slate-500">Matched Skills</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                return <td key={id} className="p-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(c?.matchedSkills || []).slice(0,8).map(s => (
                                                            <span key={s} className="px-2 py-0.5 text-[10px] rounded bg-blue-50 text-blue-700">{s}</span>
                                                        ))}
                                                    </div>
                                                </td>;
                                            })}
                                        </tr>
                                        <tr className="border-t align-top">
                                            <td className="p-2 text-slate-500">Missing Skills</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                return <td key={id} className="p-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(c?.missingSkills || []).slice(0,8).map(s => (
                                                            <span key={s} className="px-2 py-0.5 text-[10px] rounded bg-red-50 text-red-700">{s}</span>
                                                        ))}
                                                    </div>
                                                </td>;
                                            })}
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 text-slate-500">Location</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                return <td key={id} className="p-2">{c?.location || '-'}</td>;
                                            })}
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 text-slate-500">Desired Salary</td>
                                            {compareSelectedIds.map(id => {
                                                const c = candidates.find(x => x.id === id);
                                                return <td key={id} className="p-2">{c?.desiredSalary ? `$${c.desiredSalary}` : '-'}</td>;
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

      {/* RIGHT DRAWER: Candidate Detail */}
      <CandidateDrawer 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        jobCriteria={job.criteria}
      />
    </div>
  );
};

export default JobDetail;