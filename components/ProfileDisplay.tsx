
import React from 'react';
import { Resume } from '../types';
import { MailIcon, PhoneIcon, LocationMarkerIcon, BriefcaseIcon, AcademicCapIcon, SparklesIcon } from './icons';

interface ProfileDisplayProps {
  resume: Resume;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ resume }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white">{resume.contactInfo.name}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400 mt-2">
          <div className="flex items-center"><MailIcon className="h-4 w-4 mr-2 text-teal-400" /> {resume.contactInfo.email}</div>
          <div className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-teal-400" /> {resume.contactInfo.phone}</div>
          <div className="flex items-center"><LocationMarkerIcon className="h-4 w-4 mr-2 text-teal-400" /> {resume.contactInfo.location}</div>
        </div>
        <p className="mt-4 text-gray-300">{resume.summary}</p>
      </div>

      {/* Experience */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><BriefcaseIcon className="h-6 w-6 mr-3 text-teal-400" /> Experience</h2>
        <div className="space-y-6">
          {resume.experience.map((exp, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-teal-300">{exp.role}</h3>
                  <p className="text-md text-gray-300">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.location}</p>
                </div>
                <p className="text-sm text-gray-400">{exp.dates}</p>
              </div>
              <ul className="mt-3 list-disc list-inside text-gray-400 space-y-1">
                {exp.description.map((desc, i) => <li key={i}>{desc}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><AcademicCapIcon className="h-6 w-6 mr-3 text-teal-400" /> Education</h2>
        <div className="space-y-4">
          {resume.education.map((edu, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-semibold text-teal-300">{edu.degree}</h3>
                    <p className="text-md text-gray-300">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.location}</p>
                 </div>
                 <p className="text-sm text-gray-400">{edu.dates}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><SparklesIcon className="h-6 w-6 mr-3 text-teal-400" /> Skills</h2>
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 space-y-4">
          <div>
            <h3 className="font-semibold text-teal-300 mb-2">Programming Languages & Frameworks</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.programming.map(skill => <span key={skill} className="bg-gray-700 text-gray-200 px-3 py-1 text-sm rounded-full">{skill}</span>)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-teal-300 mb-2">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.technical.map(skill => <span key={skill} className="bg-gray-700 text-gray-200 px-3 py-1 text-sm rounded-full">{skill}</span>)}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-teal-300 mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.languages.map(lang => <span key={lang} className="bg-gray-700 text-gray-200 px-3 py-1 text-sm rounded-full">{lang}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;
