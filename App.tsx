import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import JobDetail from './pages/JobDetail';
import { Page, Job, User } from './types';
import { MOCK_USER } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [user, setUser] = useState<User>(MOCK_USER);

  const handleStart = () => {
    // Create a default session job
    const newJob: Job = {
      id: `session-${Date.now()}`,
      title: 'New Screening Session',
      department: 'HR',
      location: 'Remote',
      status: 'Active',
      candidateCount: 0,
      lastUpdated: 'Just now',
      description: '',
      criteria: {
        requiredSkills: [],
        preferredSkills: [],
        minExperienceYears: 0,
        domain: '',
        seniority: ''
      }
    };
    setActiveJob(newJob);
    setCurrentPage(Page.WORKSPACE);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page === Page.LANDING) {
      setActiveJob(null);
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    setActiveJob(updatedJob);
  };

  // Views
  if (currentPage === Page.LANDING) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 font-sans">
      <Sidebar 
        activePage={currentPage} 
        user={user} 
        onNavigate={handleNavigate}
        onLogout={() => setCurrentPage(Page.LANDING)}
      />
      
      <main className="flex-1 ml-0 md:ml-64 overflow-y-auto h-full">
        {currentPage === Page.WORKSPACE && activeJob && (
          <JobDetail 
            job={activeJob} 
            onUpdateJob={handleUpdateJob}
          />
        )}
      </main>
    </div>
  );
};

export default App;