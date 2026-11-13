# KINETICS Website

Corporate website for KINETICS Engineering PLC built with Next.js, featuring an interactive scroll stage, project portfolio, services overview, and static export.

## Project Structure

```
kinetics-website/
├── backend/            # Backend service placeholder (reserved for v2)
├── design-assets/      # Design assets and guidelines
├── frontend/           # Next.js App Router frontend application
│   ├── public/         # Static assets (images, logos, icons)
│   └── src/            # Source code (app, components, data, hooks, lib)
└── README.md           # Project guide and quickstart
```

## Getting Started

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```
   The static production output is exported to `frontend/out`.
