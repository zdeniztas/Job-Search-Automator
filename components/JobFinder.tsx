

import React, { useState } from 'react';
import { Job, Application, Resume, GroundingChunk, JobSearchFilters, ApplicationStatus } from '../types';
import { generateCoverLetterSnippetAPI } from '../services/geminiService';
import JobCard from './JobCard';
import Spinner from './Spinner';
import { SearchIcon, LinkIcon, PaperAirplaneIcon } from './icons';
import { toast } from 'react-hot-toast';

interface JobFinderProps {
  jobs: Job[];
  sources: GroundingChunk[];
  onFindJobs: (filters: JobSearchFilters) => void;
  isLoading: boolean;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  resume: Resume;
}

const JobFinder: React.FC<JobFinderProps> = ({ jobs, sources, onFindJobs, isLoading, applications, setApplications, resume }) => {
  const [country, setCountry] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [visaSponsorship, setVisaSponsorship] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('Any');
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  const handleSearch = () => {
    setSelectedJobIds(new Set()); // Clear selections on new search
    onFindJobs({ country, isRemote, visaSponsorship, experienceLevel });
  };
  
  const handleSelectJob = (jobId: string) => {
    setSelectedJobIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(jobId)) {
            newSet.delete(jobId);
        } else {
            newSet.add(jobId);
        }
        return newSet;
    });
  };
  
  const handleSelectAll = () => {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(jobs.map(j => j.id)));
    }
  }

  const handleBulkApply = async () => {
    setIsBulkApplying(true);
    const selectedJobs = jobs.filter(job => selectedJobIds.has(job.id) && !applications.some(app => app.job.id === job.id));
    const toastId = toast.loading(`Starting bulk apply for ${selectedJobs.length} jobs...`);
    
    const newApplications: Application[] = [];
    let successCount = 0;

    for (const [index, job] of selectedJobs.entries()) {
        try {
            toast.loading(`[${index + 1}/${selectedJobs.length}] Preparing application for ${job.title}...`, { id: toastId });
            const snippet = await generateCoverLetterSnippetAPI(resume, job);
            newApplications.push({
                job,
                status: ApplicationStatus.Applied,
                appliedDate: new Date().toLocaleDateString(),
                coverLetterSnippet: snippet,
            });
            successCount++;
        } catch (error) {
            console.error(`Failed to apply for ${job.title}`, error);
            toast.error(`[${index + 1}/${selectedJobs.length}] Failed to apply for ${job.title}. Skipping.`, { duration: 2000 });
        }
    }
    
    if (newApplications.length > 0) {
      setApplications(prev => {
        const existingAppIds = new Set(prev.map(app => app.job.id));
        const uniqueNewApps = newApplications.filter(newApp => !existingAppIds.has(newApp.job.id));
        return [...prev, ...uniqueNewApps];
      });
    }

    if (successCount > 0) {
        toast.success(`Successfully applied to ${successCount} of ${selectedJobs.length} jobs!`, { id: toastId, duration: 4000 });
    } else if (selectedJobs.length > 0) {
        toast.error('Bulk apply failed for all selected jobs.', { id: toastId });
    } else {
        toast.dismiss(toastId);
    }
    
    setSelectedJobIds(new Set());
    setIsBulkApplying(false);
  };

  return (
    <div>
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-semibold text-white">Find Your Next Opportunity</h2>
                  <p className="text-gray-400 mt-1">Use the filters below and scan live job boards for roles that match your profile.</p>
              </div>
              <button
                  onClick={handleSearch}
                  disabled={isLoading || isBulkApplying}
                  className="flex-shrink-0 flex items-center bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg"
              >
                  <SearchIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Searching...' : 'Find Jobs'}
              </button>
            </div>
            <div className="mt-6 border-t border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300">Country</label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., USA, Germany"
                  className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-300">Experience Level</label>
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option>Any</option>
                  <option>Entry-level</option>
                  <option>Junior</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center h-full pb-2">
                  <input
                    id="isRemote"
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-200">
                    Fully Remote
                  </label>
                </div>
              </div>
              <div className="flex items-end">
                 <div className="flex items-center h-full pb-2">
                  <input
                    id="visaSponsorship"
                    type="checkbox"
                    checked={visaSponsorship}
                    onChange={(e) => setVisaSponsorship(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="visaSponsorship" className="ml-2 block text-sm text-gray-200">
                    Visa Sponsorship
                  </label>
                </div>
              </div>
            </div>
        </div>

      {sources.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center"><LinkIcon className="h-4 w-4 mr-2" /> Data Sources from Google Search:</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {sources.map((source, index) => source.web && (
              <a
                key={index}
                href={source.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-400 hover:text-teal-300 hover:underline truncate"
                title={source.web.uri}
              >
                {source.web.title || new URL(source.web.uri).hostname}
              </a>
            ))}
          </div>
        </div>
      )}

      {isLoading && jobs.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {jobs.length > 0 && (
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="selectAll"
              type="checkbox"
              checked={selectedJobIds.size === jobs.length && jobs.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="selectAll" className="ml-2 block text-sm text-gray-200">
              Select All ({selectedJobIds.size} selected)
            </label>
          </div>
          <button
            onClick={handleBulkApply}
            disabled={selectedJobIds.size === 0 || isBulkApplying}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md"
          >
            {isBulkApplying ? <Spinner size="sm" /> : <PaperAirplaneIcon className="h-5 w-5 mr-2" />}
            Bulk Apply ({selectedJobIds.size})
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              applications={applications}
              setApplications={setApplications}
              resume={resume}
              isSelected={selectedJobIds.has(job.id)}
              onSelect={handleSelectJob}
            />
          ))}
        </div>
      )}
      
      {!isLoading && jobs.length === 0 && (
          <div className="text-center py-16 px-6 bg-gray-800 rounded-xl border border-gray-700">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-xl font-medium text-white">No jobs found yet</h3>
              <p className="mt-1 text-gray-400">Use the filters and start a search to discover jobs tailored for you.</p>
          </div>
      )}
    </div>
  );
};

export default JobFinder;