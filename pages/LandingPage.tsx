import React from 'react';
import { ArrowRight, CheckCircle, Upload, BrainCircuit, FileText } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-primary-600 p-1.5 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-white" />
             </div>
            <span className="font-bold text-xl text-slate-900">TalentAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-600 hover:text-slate-900 font-medium text-sm">Log In</button>
            <button 
              onClick={onStart}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 border border-primary-100">
          <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
          Now powered by Gemini 2.5
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl">
          AI-Powered CV Screening for <span className="text-primary-600">Modern HR Teams</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Upload hundreds of resumes, describe the role in plain language, and let our AI rank and explain the best-fit candidates for you in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={onStart}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-primary-500/20"
          >
            Start Screening CVs
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bulk CV Upload</h3>
              <p className="text-slate-600">Drag and drop folders of PDFs. We handle the parsing and text extraction automatically.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Intelligent Matching</h3>
              <p className="text-slate-600">Our embedding engine understands context, not just keywords, to find true talent matches.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Transparent Scoring</h3>
              <p className="text-slate-600">Don't trust black boxes. We explain exactly why a candidate was ranked high or low.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2024 TalentAI Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
