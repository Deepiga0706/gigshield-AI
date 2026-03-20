import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Brain, CloudRain, Wind, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';

const riskColors = {
  Low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bar: 'bg-green-500' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', bar: 'bg-yellow-500' },
  High: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-red-500' }
};

export default function RiskAssessment({ userData, onComplete }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 4;
      });
    }, 80);

    axios.post('http://localhost:5000/api/risk-assessment', {
      city: userData.city,
      avgDailyEarnings: userData.avgDailyEarnings
    }).then(res => {
      setTimeout(() => {
        setRisk(res.data);
        setLoading(false);
        toast.success('AI Risk Assessment Complete!');
      }, 2200);
    }).catch(() => {
      toast.error('Backend not running. Using mock data.');
      const mock = {
        riskScore: 'Medium',
        weeklyPremium: 280,
        coverageAmount: userData.avgDailyEarnings * 7,
        factors: { rainProbability: '45%', aqi: 160, baseRisk: 'Medium' }
      };
      setTimeout(() => { setRisk(mock); setLoading(false); }, 2200);
    });

    return () => clearInterval(interval);
  }, [userData]);

  if (loading) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto text-center">
        <div className="glass rounded-2xl p-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 absolute animate-pulse-ring" />
            <div className="w-20 h-20 rounded-full border-4 border-t-blue-500 border-blue-500/20 animate-spin" />
            <Brain size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">AI Analyzing Your Risk...</h2>
          <p className="text-slate-400 text-sm mb-6">Processing weather, AQI & disruption data for {userData.city}</p>
          <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-100 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 space-y-2 text-left">
            {[
              { done: progress > 25, label: '🌧️ Fetching weather data...' },
              { done: progress > 50, label: '💨 Analyzing AQI levels...' },
              { done: progress > 75, label: '📊 Computing disruption probability...' },
              { done: progress >= 100, label: '🤖 Generating risk score...' }
            ].map((item, i) => (
              <div key={i} className={`text-sm flex items-center gap-2 transition-all ${item.done ? 'text-green-400' : 'text-slate-500'}`}>
                <span>{item.done ? '✓' : '○'}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const colors = riskColors[risk.riskScore];
  const riskBarWidth = risk.riskScore === 'Low' ? '33%' : risk.riskScore === 'Medium' ? '66%' : '100%';

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">AI Risk Assessment</h2>
        <p className="text-slate-400 text-sm mt-1">Based on {userData.city} conditions</p>
      </div>

      <div className={`glass rounded-2xl p-6 border ${colors.border} mb-4`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm">Risk Score</p>
            <div className={`text-3xl font-bold ${colors.text} flex items-center gap-2 mt-1`}>
              {risk.riskScore === 'High' && <AlertTriangle size={28} />}
              {risk.riskScore}
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center`}>
            <Brain size={28} className={colors.text} />
          </div>
        </div>
        <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
          <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000`} style={{ width: riskBarWidth }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass rounded-xl p-4 text-center">
          <CloudRain size={20} className="text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Rain Prob.</p>
          <p className="font-bold text-blue-400">{risk.factors.rainProbability}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Wind size={20} className="text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">AQI Level</p>
          <p className="font-bold text-purple-400">{risk.factors.aqi}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp size={20} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Base Risk</p>
          <p className="font-bold text-orange-400">{risk.factors.baseRisk}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-4">
        <h3 className="font-semibold mb-4">Your Coverage Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Weekly Premium</span>
            <span className="font-bold text-blue-400 text-lg">₹{risk.weeklyPremium}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Coverage Amount</span>
            <span className="font-bold text-green-400 text-lg">₹{risk.coverageAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Policy Duration</span>
            <span className="font-semibold">7 Days (Auto-renew)</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete(risk)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        <span>View Policy Details</span><ArrowRight size={18} />
      </button>
    </div>
  );
}
