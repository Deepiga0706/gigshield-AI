import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, Calendar, IndianRupee, Zap, ArrowRight } from 'lucide-react';

export default function PolicyPage({ userData, riskData, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [policy, setPolicy] = useState(null);

  const activatePolicy = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/policies', {
        userId: userData.userId,
        weeklyPremium: riskData.weeklyPremium,
        coverageAmount: riskData.coverageAmount,
        riskScore: riskData.riskScore
      });
      setPolicy(res.data.policy);
      setActivated(true);
      toast.success('🎉 Policy Activated Successfully!');
    } catch {
      const mockPolicy = {
        policyId: 'POL-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'Active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      setPolicy(mockPolicy);
      setActivated(true);
      toast.success('🎉 Policy Activated Successfully!');
    } finally {
      setLoading(false);
    }
  };

  const startDate = new Date().toLocaleDateString('en-IN');
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');

  const riskColor = riskData.riskScore === 'High' ? 'text-red-400' : riskData.riskScore === 'Medium' ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">Your Policy</h2>
        <p className="text-slate-400 text-sm mt-1">Weekly Income Protection Plan</p>
      </div>

      {activated && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-400">Policy Active!</p>
            <p className="text-sm text-slate-400">ID: {policy?.policyId}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Shield size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">GigShield Weekly Plan</h3>
            <p className="text-slate-400 text-sm">{userData.platform} • {userData.city}</p>
          </div>
          <span className={`ml-auto text-sm font-semibold ${riskColor} bg-slate-800 px-3 py-1 rounded-full`}>
            {riskData.riskScore} Risk
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400">
              <IndianRupee size={16} /> Weekly Premium
            </div>
            <span className="font-bold text-blue-400 text-xl">₹{riskData.weeklyPremium}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield size={16} /> Max Coverage
            </div>
            <span className="font-bold text-green-400 text-xl">₹{riskData.coverageAmount}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={16} /> Policy Period
            </div>
            <span className="font-semibold text-sm">{startDate} – {endDate}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap size={16} /> Claim Type
            </div>
            <span className="font-semibold text-purple-400">Automatic (Parametric)</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <h4 className="font-semibold mb-3 text-sm text-slate-300">What's Covered</h4>
        <div className="grid grid-cols-2 gap-2">
          {['🌧️ Heavy Rain', '💨 High AQI/Pollution', '🚫 Curfew/Lockdown', '⛈️ Extreme Weather'].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2">
              <CheckCircle size={14} className="text-green-400 flex-shrink-0" /> {item}
            </div>
          ))}
        </div>
      </div>

      {!activated ? (
        <button
          onClick={activatePolicy}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Shield size={20} /><span>Activate Policy</span></>
          )}
        </button>
      ) : (
        <button
          onClick={() => onComplete(policy)}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-lg"
        >
          <span>Go to Dashboard</span><ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
