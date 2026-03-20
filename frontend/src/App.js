import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Onboarding from './components/Onboarding';
import RiskAssessment from './components/RiskAssessment';
import PolicyPage from './components/PolicyPage';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  const [page, setPage] = useState('onboarding');
  const [userData, setUserData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [policyData, setPolicyData] = useState(null);

  const navigate = (p) => setPage(p);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
      }} />
      <Navbar page={page} navigate={navigate} userData={userData} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {page === 'onboarding' && (
          <Onboarding onComplete={(user) => { setUserData(user); navigate('risk'); }} />
        )}
        {page === 'risk' && userData && (
          <RiskAssessment userData={userData} onComplete={(risk) => { setRiskData(risk); navigate('policy'); }} />
        )}
        {page === 'policy' && riskData && (
          <PolicyPage userData={userData} riskData={riskData} onComplete={(policy) => { setPolicyData(policy); navigate('dashboard'); }} />
        )}
        {page === 'dashboard' && userData && (
          <Dashboard userData={userData} policyData={policyData} />
        )}
      </div>
    </div>
  );
}
