
import React from 'react';
import { BriefcaseIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-teal-400" />
            <span className="ml-3 text-2xl font-bold text-white">
              AI Job Search Automator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
