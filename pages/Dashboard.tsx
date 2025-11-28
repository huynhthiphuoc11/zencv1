import React from 'react';
import { Job } from '../types';
import { Plus, Search, MoreHorizontal, Users, Clock, Briefcase } from 'lucide-react';

interface DashboardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCreateJob: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, onSelectJob, onCreateJob }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your open positions and screening sessions.</p>
        </div>
        <button 
          onClick={onCreateJob}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase },
          { label: 'Total CVs', value: '1,248', icon: Users },
          { label: 'Time Saved', value: '142h', icon: Clock },
          { label: 'Shortlisted', value: '86', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-slate-400">
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Job List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Filter</button>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-slate-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Job Title</th>
              <th className="px-6 py-3 font-medium">Department</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Candidates</th>
              <th className="px-6 py-3 font-medium">Last Updated</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                onClick={() => onSelectJob(job)}
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{job.title}</div>
                  <div className="text-xs text-slate-500">{job.location}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{job.department}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'Active' ? 'bg-green-100 text-green-700' :
                    job.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {job.candidateCount}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{job.lastUpdated}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
