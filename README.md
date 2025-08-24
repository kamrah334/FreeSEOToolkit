# SEO Toolbox - Vercel Ready

A comprehensive SEO toolbox with AI-powered content generation tools. Deploy-ready for Vercel.

## 🚀 Features

- **Meta Description Generator** - AI-powered SEO meta descriptions with template fallbacks
- **Title Case Converter** - Smart capitalization following SEO best practices  
- **Keyword Density Analyzer** - Detailed content analysis with frequency reports
- **Blog Outline Generator** - AI-generated structured outlines with H2/H3 headings

## 📦 Vercel Deployment

This app is configured for seamless Vercel deployment with:

- ✅ Serverless API functions in `/api` directory
- ✅ Static client build configured
- ✅ Environment variable setup for Hugging Face API
- ✅ Smart fallbacks if AI models are unavailable

### Deploy Steps

1. **Push to GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "SEO Toolbox ready for Vercel"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import project in Vercel dashboard
   - Add environment variable: `HUGGING_FACE_API_KEY`
   - Deploy automatically

3. **Environment Variables**
   ```
   HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## 🛠️ Local Development

```bash
npm run dev
```

The app runs Express server + Vite frontend on port 5000.

## 📁 Structure

```
├── api/                    # Vercel serverless functions
│   ├── meta-description.ts
│   ├── title-case.ts
│   ├── keyword-density.ts
│   └── blog-outline.ts
├── client/                 # React frontend
│   ├── src/
│   ├── dist/              # Build output
│   ├── package.json       # Client dependencies
│   └── vite.config.ts     # Build configuration
├── shared/                # Shared schemas
│   └── schema.ts          # Zod validation schemas
├── vercel.json            # Vercel deployment config
└── package.json           # Root dependencies
```

## 🔧 API Endpoints

- `POST /api/meta-description` - Generate SEO meta descriptions
- `POST /api/title-case` - Convert to proper title case
- `POST /api/keyword-density` - Analyze keyword density
- `POST /api/blog-outline` - Generate blog outlines

## 💡 How It Works

1. **AI Generation**: Uses Hugging Face models with multiple fallbacks
2. **Template Fallbacks**: Smart templates if AI models fail
3. **Serverless**: Each API endpoint is a Vercel function
4. **Client-Side**: React SPA with modern UI components

Built with ❤️ on Replit & Vercel