
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';
import Spinner from './Spinner';

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onUpload(e.target.files[0]);
      }
  }, [onUpload]);


  return (
    <div className="text-center max-w-2xl mx-auto mt-16 p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
      <h1 className="text-4xl font-extrabold text-white mb-4">Automate Your Job Hunt</h1>
      <p className="text-gray-400 mb-8 text-lg">
        Upload your resume to get started. Our AI will analyze your profile, scan live job boards, and find the perfect jobs for you.
      </p>

      <div className="flex items-center justify-center w-full">
          <label 
            htmlFor="dropzone-file" 
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 ${dragActive ? "border-teal-400 bg-gray-700" : ""}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                    <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold text-teal-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, or PDF</p>
                    </>
                  )}
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} accept="image/png, image/jpeg, application/pdf" disabled={isLoading} />
          </label>
      </div> 
    </div>
  );
};

export default ResumeUploader;
