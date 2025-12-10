# Design Narrator — Deploy-ready Demo

This Vite + React project contains the Design Narrator UI (Landing + Editor).
Paste messy notes on the landing page and click "Send & Process" to simulate extraction.

## Run locally
1. npm install
2. npm run dev
3. Open http://localhost:5173

## Deploy to Vercel
1. Create a GitHub repo and push the project.
2. Import the repo in Vercel (https://vercel.com/new).
3. Vercel will detect Vite:
   - Build command: npm run build
   - Output dir: dist
4. Add environment variables if you wire the AI backend later.
