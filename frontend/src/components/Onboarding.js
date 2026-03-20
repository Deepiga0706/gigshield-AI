import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, MapPin, Briefcase, IndianRupee, Clock, ArrowRight } from 'lucide-react';

const platforms = ['Zomato', 'Swiggy', 'Amazon', 'Zepto', 'Blinkit'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

export default function Onboarding({ onComplete }) {
  const [form, setForm] = useState({ name: '', city: '', platform: '', avgDailyEarnings: '', workingHours: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.platform || !form.avgDailyEarnings || !form.workingHours) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users', {
        ...form,
        avgDailyEarnings: Number(form.avgDailyEarnings),
        workingHours: Number(form.workingHours)
      });
      toast.success('Welcome to GigShield AI! 🎉');
      setTimeout(() => onComplete(res.data.user), 800);
    } catch {
      toast.error('Server error. Please start the backend.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Enter your name' },
    { key: 'avgDailyEarnings', label: 'Avg Daily Earnings (₹)', icon: IndianRupee, type: 'number', placeholder: 'e.g. 800' },
    { key: 'workingHours', label: 'Working Hours/Day', icon: Clock, type: 'number', placeholder: 'e.g. 8' }
  ];

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm mb-4">
          🛡️ Income Protection for Gig Workers
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">GigShield AI</h1>
        <p className="text-slate-400">Parametric insurance that pays automatically when disruptions hit</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User size={20} className="text-blue-400" /> Create Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-slate-400 mb-1 block">{label}</label>
              <div className="relative">
                <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          ))}

          <div>
            <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1">
              <MapPin size={14} /> City
            </label>
            <select
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select your city</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block flex items-center gap-1">
              <Briefcase size={14} /> Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, platform: p })}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    form.platform === p
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><span>Get My Risk Assessment</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
