import React, { useEffect, useState } from 'react';
import { Candidate, JobCriteria } from '../types';
import { generateCandidateExplanation } from '../services/geminiService';
import { X, ExternalLink, Mail, Phone, MapPin, Download, ThumbsUp, ThumbsDown, Sparkles, FileText } from 'lucide-react';

interface CandidateDrawerProps {
  candidate: Candidate | null;
  onClose: () => void;
  jobCriteria: JobCriteria;
}

const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ candidate, onClose, jobCriteria }) => {
  const [explanation, setExplanation] = useState<string[]>([]);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (candidate) {
        setLoadingExplanation(true);
        // Use Gemini to generate fresh explanation based on CURRENT criteria
        generateCandidateExplanation(candidate.name, candidate.skills, jobCriteria)
        .then(res => {
            setExplanation(res.length > 0 ? res : candidate.explanation); // Fallback to static if API fails/empty
        })
        .finally(() => setLoadingExplanation(false));
    }
  }, [candidate, jobCriteria]);

  if (!candidate) return null;

  // SAFEGUARD: Ensure we don't call methods on undefined values
  const isPDF = candidate.fileType === 'application/pdf' || 
               (candidate.resumeUrl ? candidate.resumeUrl.toLowerCase().endsWith('.pdf') : false);

  return (
    <div className="absolute inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white">
        <div>
           <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
           <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {candidate.email}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidate.location}</span>
           </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Score Card */}
        <div className="bg-slate-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Match Score</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                     candidate.matchLevel === 'High' ? 'bg-green-100 text-green-800' :
                     candidate.matchLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>{candidate.matchLevel} Match</span>
            </div>
            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold inline-block text-primary-600">
                            {candidate.matchScore}%
                        </span>
                    </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                    <div style={{ width: `${candidate.matchScore}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
                </div>
            </div>

            {/* AI Explanation */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                 <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-slate-900 text-sm">AI Analysis</h4>
                 </div>
                 {loadingExplanation ? (
                     <div className="space-y-2 animate-pulse">
                         <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                         <div className="h-2 bg-slate-200 rounded w-full"></div>
                         <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                     </div>
                 ) : (
                    <ul className="space-y-2">
                        {explanation.map((point, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0"></span>
                                {point}
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
        </div>

        {/* Skills */}
        <div>
            <h3 className="font-semibold text-slate-900 mb-3">Skills Breakdown</h3>
            <div className="flex flex-wrap gap-2">
                {candidate.matchedSkills.map(skill => (
                     <span key={skill} className="px-3 py-1 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                        {skill}
                    </span>
                ))}
                {candidate.missingSkills.map(skill => (
                     <span key={skill} className="px-3 py-1 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-100 opacity-60">
                        Missing: {skill}
                    </span>
                ))}
            </div>
        </div>

        {/* Experience */}
        <div>
            <h3 className="font-semibold text-slate-900 mb-3">Work Experience</h3>
            <div className="space-y-4">
                {candidate.experiences.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-4 py-1">
                        <h4 className="font-medium text-slate-900">{exp.role}</h4>
                        <div className="text-xs text-slate-500 mb-2">{exp.company} • {exp.duration}</div>
                        <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Resume Preview */}
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">Original Resume</h3>
                {candidate.resumeUrl && (
                     <a 
                        href={candidate.resumeUrl} 
                        download={`resume-${candidate.name}`}
                        className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        <Download className="w-4 h-4" /> Download
                    </a>
                )}
            </div>
            <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-inner">
                {candidate.resumeUrl ? (
                    // Native PDF viewing via Iframe
                    (isPDF || !candidate.fileType) ? (
                        <iframe 
                            src={candidate.resumeUrl} 
                            className="w-full h-full" 
                            title="Resume PDF"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-gray-50">
                            <FileText className="w-16 h-16 mb-4 text-slate-300" />
                            <p className="font-medium mb-1 text-slate-700">Preview not available for this file type</p>
                            <p className="text-sm text-slate-400 mb-4 font-mono">{candidate.fileType || 'Unknown format'}</p>
                            <a 
                                href={candidate.resumeUrl} 
                                download
                                className="bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Download to View
                            </a>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-gray-50">
                        <FileText className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm font-medium">No Resume Document Available</span>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-sm">
            <ThumbsUp className="w-5 h-5" /> Shortlist
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 py-3 rounded-lg font-medium transition-colors shadow-sm">
            <ThumbsDown className="w-5 h-5" /> Reject
        </button>
      </div>
    </div>
  );
};

export default CandidateDrawer;