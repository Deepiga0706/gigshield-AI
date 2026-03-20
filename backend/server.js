const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory storage
let users = [];
let policies = [];
let claims = [];
let disruptions = [];

// Mock weather/risk data by city
const cityRiskData = {
  'Mumbai': { rainProb: 0.7, aqi: 180, baseRisk: 'High' },
  'Delhi': { rainProb: 0.4, aqi: 250, baseRisk: 'High' },
  'Bangalore': { rainProb: 0.5, aqi: 120, baseRisk: 'Medium' },
  'Hyderabad': { rainProb: 0.4, aqi: 140, baseRisk: 'Medium' },
  'Chennai': { rainProb: 0.6, aqi: 130, baseRisk: 'Medium' },
  'Kolkata': { rainProb: 0.5, aqi: 200, baseRisk: 'High' },
  'Pune': { rainProb: 0.4, aqi: 110, baseRisk: 'Low' }
};

// User onboarding
app.post('/api/users', (req, res) => {
  const { name, city, platform, avgDailyEarnings, workingHours } = req.body;
  const userId = uuidv4();
  const user = { userId, name, city, platform, avgDailyEarnings, workingHours, createdAt: new Date() };
  users.push(user);
  res.json({ success: true, user });
});

// Get user
app.get('/api/users/:userId', (req, res) => {
  const user = users.find(u => u.userId === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// AI Risk Assessment
app.post('/api/risk-assessment', (req, res) => {
  const { city, avgDailyEarnings } = req.body;
  const cityData = cityRiskData[city] || { rainProb: 0.3, aqi: 100, baseRisk: 'Low' };
  
  let riskScore = 'Low';
  let riskMultiplier = 1.0;
  
  if (cityData.rainProb > 0.6 || cityData.aqi > 200) {
    riskScore = 'High';
    riskMultiplier = 1.5;
  } else if (cityData.rainProb > 0.4 || cityData.aqi > 150) {
    riskScore = 'Medium';
    riskMultiplier = 1.25;
  }
  
  const weeklyEarnings = avgDailyEarnings * 7;
  const basePremium = weeklyEarnings * 0.05;
  const weeklyPremium = Math.round(basePremium * riskMultiplier);
  const coverageAmount = weeklyEarnings;
  
  res.json({
    riskScore,
    weeklyPremium,
    coverageAmount,
    cityData,
    factors: {
      rainProbability: `${(cityData.rainProb * 100).toFixed(0)}%`,
      aqi: cityData.aqi,
      baseRisk: cityData.baseRisk
    }
  });
});

// Create Policy
app.post('/api/policies', (req, res) => {
  const { userId, weeklyPremium, coverageAmount, riskScore } = req.body;
  const policyId = uuidv4();
  const policy = {
    policyId,
    userId,
    weeklyPremium,
    coverageAmount,
    riskScore,
    status: 'Active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };
  policies.push(policy);
  res.json({ success: true, policy });
});

// Get user policies
app.get('/api/policies/user/:userId', (req, res) => {
  const userPolicies = policies.filter(p => p.userId === req.params.userId);
  res.json(userPolicies);
});

// Simulate disruption
app.post('/api/disruptions/simulate', (req, res) => {
  const { type, city, severity } = req.body;
  const disruptionId = uuidv4();
  const disruption = {
    disruptionId,
    type,
    city,
    severity,
    timestamp: new Date(),
    active: true
  };
  disruptions.push(disruption);
  
  // Auto-trigger claims for affected users
  const affectedUsers = users.filter(u => u.city === city);
  const triggeredClaims = [];
  
  affectedUsers.forEach(user => {
    const activePolicy = policies.find(p => p.userId === user.userId && p.status === 'Active');
    if (activePolicy) {
      const daysAffected = severity === 'High' ? 2 : 1;
      const payoutAmount = user.avgDailyEarnings * daysAffected;
      
      // Fraud detection
      const recentClaims = claims.filter(c => c.userId === user.userId && 
        (Date.now() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000);
      const fraudRisk = recentClaims.length > 2 ? 'High' : recentClaims.length > 0 ? 'Medium' : 'Low';
      
      const claimId = uuidv4();
      const claim = {
        claimId,
        userId: user.userId,
        policyId: activePolicy.policyId,
        disruptionId,
        disruptionType: type,
        daysAffected,
        payoutAmount,
        status: fraudRisk === 'High' ? 'Under Review' : 'Approved',
        fraudRisk,
        createdAt: new Date(),
        processedAt: new Date()
      };
      claims.push(claim);
      triggeredClaims.push(claim);
    }
  });
  
  res.json({ success: true, disruption, triggeredClaims });
});

// Get claims for user
app.get('/api/claims/user/:userId', (req, res) => {
  const userClaims = claims.filter(c => c.userId === req.params.userId);
  res.json(userClaims);
});

// Get dashboard data
app.get('/api/dashboard/:userId', (req, res) => {
  const user = users.find(u => u.userId === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const userPolicies = policies.filter(p => p.userId === req.params.userId);
  const activePolicy = userPolicies.find(p => p.status === 'Active');
  const userClaims = claims.filter(c => c.userId === req.params.userId);
  const totalPayouts = userClaims.reduce((sum, c) => sum + (c.status === 'Approved' ? c.payoutAmount : 0), 0);
  
  res.json({
    user,
    activePolicy,
    totalPolicies: userPolicies.length,
    totalClaims: userClaims.length,
    totalPayouts,
    claims: userClaims,
    riskScore: activePolicy ? activePolicy.riskScore : 'N/A'
  });
});

// Get active disruptions
app.get('/api/disruptions/active', (req, res) => {
  const activeDisruptions = disruptions.filter(d => d.active);
  res.json(activeDisruptions);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`GigShield AI Backend running on port ${PORT}`);
});
