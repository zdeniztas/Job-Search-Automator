
import React, { useState, useCallback } from 'react';
import { Resume, Job, Application, GroundingChunk, JobSearchFilters } from './types';
import { parseResumeAPI, findJobsAPI } from './services/geminiService';
import Header from './components/Header';
import ResumeUploader from './components/ResumeUploader';
import Dashboard from './components/Dashboard';
import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    toast.loading('Parsing your resume...');
    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      const parsedResume = await parseResumeAPI(file.type, base64Image);
      setResume(parsedResume);
      toast.dismiss();
      toast.success('Resume parsed successfully!');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to parse resume: ${errorMessage}`);
      toast.dismiss();
      toast.error(`Failed to parse resume: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFindJobs = useCallback(async (filters: JobSearchFilters) => {
    if (!resume) return;
    setIsLoading(true);
    setError(null);
    setJobs([]);
    setSources([]);
    toast.loading('Searching live job boards with your filters...');
    try {
      const { jobs: foundJobs, sources: foundSources } = await findJobsAPI(resume, filters);
      setJobs(foundJobs);
      setSources(foundSources);
      toast.dismiss();
      toast.success(`Found ${foundJobs.length} job opportunities!`);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to find jobs: ${errorMessage}`);
      toast.dismiss();
      toast.error(`Failed to find jobs: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [resume]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!resume ? (
          <ResumeUploader onUpload={handleResumeUpload} isLoading={isLoading} />
        ) : (
          <Dashboard
            resume={resume}
            jobs={jobs}
            sources={sources}
            applications={applications}
            setApplications={setApplications}
            onFindJobs={handleFindJobs}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
};

export default App;