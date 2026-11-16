# CachePulse

A full-stack semantic caching gateway workbench for LLM applications. Built with Vite, React, TypeScript, Tailwind CSS v4, and Vercel Serverless Functions.

## Features
- Prompt playground with exact and similarity-based demo cache matching
- Cache hit/miss telemetry, token and estimated cost savings
- Configurable similarity threshold, TTL, capacity, and matching policy
- Serverless `/api/cache` and `/api/clear` endpoints
- Graceful local demo fallback when the Vercel API runtime is unavailable

## Local development

```bash
npm install
npm run dev
```

For local serverless API testing, install the Vercel CLI and run `vercel dev`.

## Production build

```bash
npm run build
```

## Deploy to Vercel
Import this repository into Vercel. The project uses the Vite framework preset and includes serverless functions in `/api`.

## API
- `GET /api/cache` — cache statistics and configuration
- `POST /api/cache` — evaluate and cache a prompt
- `POST /api/clear` — clear the in-memory cache

> The included cache is intentionally an in-memory demonstration. Serverless instances can restart and do not share memory. Use Redis or another shared store for durable, cross-instance production caching. Cache misses simulate an upstream model response; no external LLM provider is called by default.
