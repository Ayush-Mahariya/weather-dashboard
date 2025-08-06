import React from 'react';
import { Cloud, Github, ExternalLink } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Weather Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Interactive spatial weather analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/ayush-mahariya/weather-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">View Code</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;