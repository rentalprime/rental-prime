import React from 'react';

const ProgressBar = ({ steps, currentStep }) => (
  <nav aria-label="Progress" className="mb-4">
    <ol className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <li key={step.label} className="flex-1 flex flex-col items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${idx <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'} transition-all`}
               title={step.label}>
            <span className="text-xl" aria-hidden>{step.icon}</span>
          </div>
          <span className={`mt-2 text-xs font-semibold ${idx === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step.label}</span>
          {idx < steps.length - 1 && (
            <div className="w-full h-1 bg-gray-200 mt-2 mb-2">
              <div className={`h-1 ${idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: '100%' }} />
            </div>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default ProgressBar;
