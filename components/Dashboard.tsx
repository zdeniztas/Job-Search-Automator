
import React, { useState } from 'react';
import { Resume, Job, Application, GroundingChunk, JobSearchFilters } from '../types';
import ProfileDisplay from './ProfileDisplay';
import JobFinder from './JobFinder';
import ApplicationTracker from './ApplicationTracker';
import { UserIcon, SearchIcon, ClipboardListIcon } from './icons';

interface DashboardProps {
  resume: Resume;
  jobs: Job[];
  sources: GroundingChunk[];
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  onFindJobs: (filters: JobSearchFilters) => void;
  isLoading: boolean;
}

type Tab = 'profile' | 'finder' | 'tracker';

const Dashboard: React.FC<DashboardProps> = ({ resume, jobs, sources, applications, setApplications, onFindJobs, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('finder');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileDisplay resume={resume} />;
      case 'finder':
        return <JobFinder 
                    jobs={jobs} 
                    sources={sources}
                    onFindJobs={onFindJobs} 
                    isLoading={isLoading} 
                    applications={applications}
                    setApplications={setApplications}
                    resume={resume}
                />;
      case 'tracker':
        return <ApplicationTracker applications={applications} setApplications={setApplications} />;
      default:
        return null;
    }
  };
  
  const getTabClass = (tabName: Tab) => {
    return `flex items-center py-3 px-4 rounded-lg cursor-pointer transition-colors duration-200 ${
      activeTab === tabName ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-3">
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 sticky top-24">
          <h2 className="text-lg font-semibold text-white mb-4 px-2">Menu</h2>
          <nav className="space-y-2">
            <div onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
              <UserIcon className="h-5 w-5 mr-3" /> Profile
            </div>
            <div onClick={() => setActiveTab('finder')} className={getTabClass('finder')}>
              <SearchIcon className="h-5 w-5 mr-3" /> Job Finder
            </div>
            <div onClick={() => setActiveTab('tracker')} className={getTabClass('tracker')}>
              <ClipboardListIcon className="h-5 w-5 mr-3" /> Application Tracker
            </div>
          </nav>
        </div>
      </aside>
      <div className="lg:col-span-9">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;