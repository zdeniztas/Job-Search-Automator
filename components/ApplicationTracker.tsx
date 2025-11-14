

import React, { useState, useCallback } from 'react';
import { Application, ApplicationStatus } from '../types';
import { generateFollowUpAPI } from '../services/geminiService';
import { ClipboardListIcon, MailIcon, EyeIcon } from './icons';
import Spinner from './Spinner';
import { toast } from 'react-hot-toast';

interface ApplicationTrackerProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const Modal: React.FC<{ title: string; content: string; onClose: () => void; showCopy?: boolean }> = ({ title, content, onClose, showCopy = false }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <textarea
                readOnly
                value={content}
                className="w-full h-64 bg-gray-900 text-gray-300 p-3 rounded-lg border border-gray-600 resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
                {showCopy && <button onClick={() => { navigator.clipboard.writeText(content); toast.success("Copied to clipboard!"); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Copy</button>}
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button>
            </div>
        </div>
    </div>
);


const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ applications, setApplications }) => {
  const [generatingFollowUpFor, setGeneratingFollowUpFor] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);

  const handleStatusChange = (jobId: string, newStatus: ApplicationStatus) => {
    setApplications(apps =>
      apps.map(app => (app.job.id === jobId ? { ...app, status: newStatus } : app))
    );
  };
  
  const handleGenerateFollowUp = useCallback(async (application: Application) => {
      setGeneratingFollowUpFor(application.job.id);
      try {
        const content = await generateFollowUpAPI(application.job);
        setModalContent(content);
        setModalTitle("Generated Follow-Up Email");
        setShowCopyButton(true);
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to generate follow-up:", error);
        toast.error("Could not generate follow-up email.");
      } finally {
        setGeneratingFollowUpFor(null);
      }
  }, []);

  const handleViewSnippet = (snippet: string) => {
    setModalContent(snippet);
    setModalTitle("Generated Cover Letter Snippet");
    setShowCopyButton(false);
    setIsModalOpen(true);
  }

  if (applications.length === 0) {
    return (
        <div className="text-center py-16 px-6 bg-gray-800 rounded-xl border border-gray-700">
            <ClipboardListIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-xl font-medium text-white">No applications yet</h3>
            <p className="mt-1 text-gray-400">Find and apply for jobs to track them here.</p>
        </div>
    );
  }

  const statusColors: Record<ApplicationStatus, string> = {
    [ApplicationStatus.Applied]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    [ApplicationStatus.Interviewing]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    [ApplicationStatus.Offer]: 'bg-green-500/20 text-green-300 border-green-500/30',
    [ApplicationStatus.Rejected]: 'bg-red-500/20 text-red-300 border-red-500/30',
    [ApplicationStatus.Wishlist]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {isModalOpen && <Modal title={modalTitle} content={modalContent} onClose={() => setIsModalOpen(false)} showCopy={showCopyButton} />}
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-white">Application Tracker</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Position</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Company</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Date Applied</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Status</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {applications.map(app => (
              <tr key={app.job.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{app.job.title}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{app.job.company}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{app.appliedDate}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.job.id, e.target.value as ApplicationStatus)}
                    className={`border text-center text-xs font-semibold rounded-full px-2.5 py-1 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 bg-gray-900 ${statusColors[app.status]}`}
                  >
                    {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleGenerateFollowUp(app)} disabled={generatingFollowUpFor === app.job.id} className="text-teal-400 hover:text-teal-300 disabled:text-gray-500 disabled:cursor-wait transition-colors flex items-center">
                      {generatingFollowUpFor === app.job.id ? <Spinner size="sm"/> : <> <MailIcon className="h-4 w-4 mr-1.5" /> Follow Up</>}
                    </button>
                    {app.coverLetterSnippet && (
                      <button onClick={() => handleViewSnippet(app.coverLetterSnippet!)} title="View generated cover letter snippet" className="text-gray-400 hover:text-white transition-colors">
                        <EyeIcon className="h-5 w-5"/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationTracker;