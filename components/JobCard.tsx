

import React, { useState, useCallback } from 'react';
import { Job, Application, ApplicationStatus, Resume } from '../types';
import { generateCoverLetterSnippetAPI } from '../services/geminiService';
import { LocationMarkerIcon, CheckCircleIcon, ExternalLinkIcon, GlobeIcon, TrendingUpIcon } from './icons';
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';

interface JobCardProps {
  job: Job;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  resume: Resume;
  isSelected: boolean;
  onSelect: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, applications, setApplications, resume, isSelected, onSelect }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetterSnippet, setCoverLetterSnippet] = useState('');

  const isApplied = applications.some(app => app.job.id === job.id);

  const handleApply = useCallback(async () => {
    setIsApplying(true);
    toast.loading('Generating cover letter snippet...');

    try {
      const snippet = await generateCoverLetterSnippetAPI(resume, job);
      setCoverLetterSnippet(snippet);
      toast.dismiss();

      // Simulate confirmation and application submission
      setTimeout(() => {
        const newApplication: Application = {
            job,
            status: ApplicationStatus.Applied,
            appliedDate: new Date().toLocaleDateString(),
            coverLetterSnippet: snippet,
        };
        setApplications(prev => {
           if (prev.some(p => p.job.id === newApplication.job.id)) return prev;
           return [...prev, newApplication];
        });
        toast.success(`Application prepared for ${job.title}!`);
        setIsApplying(false);
      }, 1000); // Short delay to simulate final step

    } catch (error) {
        console.error("Failed to generate snippet:", error);
        toast.dismiss();
        toast.error("Could not prepare application.");
        setIsApplying(false);
    }
  }, [resume, job, setApplications]);

  const RelevanceIndicator: React.FC<{ score: number }> = ({ score }) => {
    const getColor = (s: number) => {
      if (s > 85) return 'bg-green-500';
      if (s > 70) return 'bg-yellow-500';
      return 'bg-orange-500';
    };
    return (
        <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${getColor(score)} mr-2`}></div>
            <span className="text-sm font-medium text-gray-300">Relevance: {score}%</span>
        </div>
    );
  };

  return (
    <div className={`bg-gray-800 border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/20 relative ${isSelected ? 'border-teal-500' : 'border-gray-700 hover:border-gray-600'}`}>
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(job.id)}
          className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-teal-600 focus:ring-teal-500 cursor-pointer"
          aria-label={`Select job: ${job.title}`}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pl-8">
        <div>
          <h3 className="text-xl font-bold text-white">{job.title}</h3>
          <p className="text-md text-gray-300">{job.company}</p>
          <div className="flex flex-wrap items-center text-sm text-gray-400 mt-2 gap-x-4 gap-y-1">
            <span className="flex items-center">
              <LocationMarkerIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              {job.location}
            </span>
             <span className="flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              {job.experienceLevel}
            </span>
            {job.visaSponsorship && (
               <span className="flex items-center text-cyan-300 font-medium">
                <GlobeIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                Visa Sponsorship
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 pt-1">
          <RelevanceIndicator score={job.relevanceScore} />
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition-colors">
              <ExternalLinkIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
      <p className="text-gray-400 mt-4 pl-8">{job.description}</p>
      
      {coverLetterSnippet && isApplying && (
          <div className="mt-4 ml-8 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <p className="text-sm font-semibold text-teal-300 mb-1">Generated Cover Letter Snippet:</p>
              <p className="text-sm text-gray-300 italic">"{coverLetterSnippet}"</p>
          </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleApply}
          disabled={isApplied || isApplying || isSelected}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center shadow-md ${
            isApplied
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : `bg-teal-600 hover:bg-teal-700 text-white ${isSelected ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' : 'disabled:bg-gray-500'}`
          }`}
          title={isSelected ? "Deselect to apply individually, or use Bulk Apply" : ""}
        >
          {isApplying ? <Spinner size="sm" /> : isApplied ? (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" /> Applied
            </>
          ) : (
            'Prepare Application'
          )}
        </button>
      </div>
    </div>
  );
};

export default JobCard;