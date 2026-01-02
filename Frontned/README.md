# Pastebin Lite - Frontend

React frontend for the Pastebin Lite application.

## Tech Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Running Locally

```bash
# Install dependencies
npm install

# Set API URL (optional - defaults to same origin)
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

The app runs on http://localhost:5173

## Building for Production

```bash
npm run build
```

Output is in the `dist/` folder.

## Deployment

Deploy to Vercel:
1. Import this folder in Vercel
2. Set `VITE_API_URL` environment variable to your backend URL
