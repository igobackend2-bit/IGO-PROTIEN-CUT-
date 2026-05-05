# IGO Protein Cuts - Professional E-commerce Platform

A high-performance, professional meat e-commerce platform built with React, Vite, and Tailwind CSS. Optimized for high conversion and premium user experience.

## Key Features
- **Smart Global Search**: Real-time filtering with trending suggestions and auto-scroll.
- **Advanced Cart**: Integrated Delivery Slot Picker (Express & Scheduled) and Free Delivery progress tracking.
- **Professional Auth**: Email-only authentication with secure OTP verification logic.
- **Dynamic Profile**: Comprehensive user dashboard with Order History, Saved Addresses, and Rewards.
- **Product Quick View**: Detailed product overlays with integrated Recipe and Review tabs.
- **Responsive Design**: Fully optimized for mobile and desktop shopping.

## Deployment to Vercel

This project is optimized for [Vercel](https://vercel.com/). Follow these steps to take it live:

### Option 1: Vercel CLI (Recommended for instant live)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts to deploy.

### Option 2: GitHub Integration
1. Push this project to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click "New Project" and select your repository.
4. Vercel will automatically detect Vite and deploy.

## Environment Variables
If you want to enable the **Live AI Assistant**, add the following to your Vercel Environment Variables:
- `VITE_GEMINI_API_KEY`: Your Google Gemini API Key.

## Tech Stack
- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion / Motion for React
- **Icons**: Lucide React
- **State Management**: React Context API
