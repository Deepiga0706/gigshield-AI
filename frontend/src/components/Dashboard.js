import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Zap, TrendingUp, CheckCircle, Clock, IndianRupee, CloudRain, Wind, Ban } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fraudColors = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400' };
const fraudBg = { Low: 'bg-green-500/20', Medium: 'bg-yellow-500/20', High: 'bg-red-500/20' };

const disruptions = [
  { type: 'Heavy Rain', icon: CloudRain, color: 'text-blue-400', severity: 'High' },
  { type: 'High AQI', icon: Wind, color: 'text-purple-400', severity: 'Medium' },
  { type: 'Curfew', icon: Ban, color: 'text-red-400', severity: 'High' }
];

export default function Dashboard({ userData, policyData }) {
  const [dashboard, setDashboard] = useState(null);
  const [claims, setClaims] = useState([]);
  const [simulating, setSimulating] = useState(null);
  const [showPayout, setShowPayout] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/${userData.userId}`);
      setDashboard(res.data);
      setClaims(res.data.claims || []);
    } catch {
      setDashboard({
        user: userData,
        activePolicy: policyData,
        totalClaims: 0,
        totalPayouts: 0,
        claims: [],
        riskScore: policyData?.riskScore || 'Medium'
      });
    }
  };

  useEffect(() => { fetchDashboard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const simulateDisruption = async (disruption) => {
    setSimulating(disruption.type);
    toast.loading(`Simulating ${disruption.type}...`, { id: 'sim' });
    try {
      const res = await axios.post('http://localhost:5000/api/disruptions/simulate', {
        type: disruption.type,
        city: userData.city,
        severity: disruption.severity
      });
      toast.dismiss('sim');
      const triggered = res.data.triggeredClaims;
      if (triggered && triggered.length > 0) {
        const claim = triggered[0];
        setShowPayout(claim);
        toast.success(`Claim auto-triggered! ₹${claim.payoutAmount} approved`);
        fetchDashboard();
      } else {
        toast.error('No active policy found for auto-claim');
      }
    } catch {
      toast.dismiss('sim');
      const mockClaim = {
        claimId: 'CLM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        disruptionType: disruption.type,
        daysAffected: disruption.severity === 'High' ? 2 : 1,
        payoutAmount: userData.avgDailyEarnings * (disruption.severity === 'High' ? 2 : 1),
        status: 'Approved',
        fraudRisk: 'Low',
        createdAt: new Date()
      };
      setShowPayout(mockClaim);
      setClaims(prev => [mockClaim, ...prev]);
      toast.success(`Claim auto-triggered! ₹${mockClaim.payoutAmount} approved`);
    } finally {
      setSimulating(null);
    }
  };

  const riskColor = { Low: 'text-green-400', Medium: 'text-yellow-400', High: 'text-red-400' };
  const riskScore = dashboard?.riskScore || 'Medium';

  const chartData = {
    labels: claims.slice(0, 5).map((c, i) => `Claim ${i + 1}`),
    datasets: [{
      label: 'Payout (₹)',
      data: claims.slice(0, 5).map(c => c.payoutAmount || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Dashboard</h2>
          <p className="text-slate-400 text-sm">Welcome back, {userData.name} 👋</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${fraudBg[riskScore]} ${riskColor[riskScore]}`}>
          {riskScore} Risk
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Policy Status', value: dashboard?.activePolicy ? 'Active' : 'None', icon: Shield, color: 'text-green-400' },
          { label: 'Weekly Premium', value: `₹${policyData?.weeklyPremium || 0}`, icon: IndianRupee, color: 'text-blue-400' },
          { label: 'Total Claims', value: claims.length, icon: Zap, color: 'text-purple-400' },
          { label: 'Total Payouts', value: `₹${claims.reduce((s, c) => s + (c.status === 'Approved' ? (c.payoutAmount || 0) : 0), 0)}`, icon: TrendingUp, color: 'text-orange-400' }
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`font-bold text-lg ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Simulate Disruption */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" /> Simulate Disruption
        </h3>
        <p className="text-slate-400 text-xs mb-4">Trigger a parametric event to auto-generate a claim</p>
        <div className="grid grid-cols-3 gap-3">
          {disruptions.map(d => (
            <button
              key={d.type}
              onClick={() => simulateDisruption(d)}
              disabled={!!simulating}
              className="glass border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              {simulating === d.type ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <d.icon size={24} className={d.color} />
              )}
              <span className="text-xs font-medium text-center">{d.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${d.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {d.severity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payout Success Popup */}
      {showPayout && (
        <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle size={28} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-green-400 text-lg">Claim Auto-Approved! 🎉</p>
              <p className="text-slate-300 text-sm mt-1">Disruption: {showPayout.disruptionType}</p>
              <p className="text-slate-300 text-sm">Days Affected: {showPayout.daysAffected}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-400 text-sm">Payout Amount:</span>
                <span className="text-2xl font-bold text-green-400">₹{showPayout.payoutAmount}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${fraudBg[showPayout.fraudRisk]} ${fraudColors[showPayout.fraudRisk]}`}>
                  Fraud Risk: {showPayout.fraudRisk}
                </span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  ✓ Payment Simulated
                </span>
              </div>
            </div>
            <button onClick={() => setShowPayout(null)} className="text-slate-500 hover:text-white text-xl">×</button>
          </div>
        </div>
      )}

      {/* Claims History */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" /> Claims History
        </h3>
        {claims.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No claims yet. Simulate a disruption to trigger one.</p>
        ) : (
          <div className="space-y-3">
            {claims.map((claim, i) => (
              <div key={claim.claimId || i} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{claim.disruptionType}</p>
                  <p className="text-xs text-slate-400">{claim.daysAffected} day(s) affected</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${fraudBg[claim.fraudRisk]} ${fraudColors[claim.fraudRisk]}`}>
                      Fraud: {claim.fraudRisk}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">₹{claim.payoutAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${claim.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {claims.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" /> Payout History
          </h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Active Policy Card */}
      {policyData && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-blue-400" /> Active Policy
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Platform</p>
              <p className="font-semibold">{userData.platform}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-400 text-xs">City</p>
              <p className="font-semibold">{userData.city}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Coverage</p>
              <p className="font-semibold text-green-400">₹{policyData.coverageAmount}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Status</p>
              <p className="font-semibold text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" /> Active
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
