# gigshield-AI
AI-powered parametric insurance platform 
Project Title:
GigShield AI – Parametric Insurance for Quick-Commerce Delivery Workers

Problem Statement:
Quick-commerce delivery workers depend on daily earnings. External disruptions such as heavy rainfall, extreme heat, air pollution, or curfews can suddenly stop deliveries, causing immediate income loss.
Currently, there is no automated protection system to compensate delivery workers during such disruptions.

Our Solution:
GigShield AI is an AI-powered parametric insurance platform designed for quick-commerce delivery workers (Zepto / Blinkit).

The system:

• Monitors environmental and social disruptions
• Predicts risk using AI
• Calculates weekly insurance premium
• Automatically triggers claims when disruptions occur
• Instantly pays compensation for lost income

Target Persona

Quick-commerce delivery partners working for platforms like:

1)Zepto
2)Blinkit
3)Instamart

These workers rely on hourly or per-delivery earnings, making them vulnerable to sudden disruptions.

Key Features
1. AI Risk Assessment

The system evaluates risk using:

historical weather data

delivery zone conditions

disruption frequency

This allows dynamic weekly premium pricing.

2. Parametric Insurance Triggers

Automated triggers include:

Heavy Rainfall (>20mm)

Heatwave (>40°C)

Severe Air Pollution (AQI > 300)

Local Curfews

Flood Alerts

When these conditions are detected, claims are automatically triggered.

3. Fraud Detection

The system prevents fraudulent claims by:

verifying weather API data

validating worker location

detecting duplicate claims

anomaly detection

4. Instant Payout

After verification, compensation is transferred instantly through a simulated payment gateway.

System Workflow

Worker Registration
↓
AI Risk Profiling
↓
Weekly Premium Calculation
↓
Worker Activates Policy
↓
System Monitors Disruptions (Weather APIs)
↓
Trigger Detected
↓
Automatic Claim Generation
↓
Fraud Detection Check
↓
Instant Payout

Tech Stack:
Frontend:
React 
Backend:
Python (Flask / FastAPI)
AI / ML:
Python + Scikit-learn
APIs:
OpenWeather API
Google Maps API
Database:
MongoDB / Firebase
Payments:
Razorpay Sandbox

Future Improvements:

Integration with real delivery platforms

Advanced ML risk prediction

Real-time route disruption analysis

Multi-city deployment
