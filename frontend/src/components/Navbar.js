import React from 'react';
import { Shield } from 'lucide-react';

const steps = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'risk', label: 'Risk AI' },
  { id: 'policy', label: 'Policy' },
  { id: 'dashboard', label: 'Dashboard' }
];

export default function Navbar({ page, navigate, userData }) {
  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">GigShield AI</span>
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => userData && navigate(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                page === s.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
