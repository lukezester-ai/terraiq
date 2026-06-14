# TerraIQ Vercel Production Checklist

## Project Settings

Use the GitHub repository for TerraIQ and deploy the Next.js frontend from this monorepo.

Recommended Vercel settings when the project root is the repository root:

- Install Command: `npm --prefix frontend/next-app ci`
- Build Command: `npm --prefix frontend/next-app run build`
- Output Directory: `frontend/next-app/.next`
- Development Command: `npm --prefix frontend/next-app run dev -- --webpack`

The root `vercel.json` contains these same settings.

## Required Environment Variables

Set these in Vercel for Production, Preview, and Development as appropriate:

- `OPENAI_API_KEY`: server-side key for `/api/ai`.
- `OPENAI_MODEL`: default `gpt-4o`.
- `TERRAIQ_ADMIN_PASSWORD`: strong admin password. Do not use `change_me`.
- `NEXT_PUBLIC_API_URL`: public URL for the FastAPI backend, for example `https://api.terraiq.me`.
- `FRONTEND_BASE_URL`: public frontend URL, for example `https://terraiq.me`.
- `STRIPE_API_KEY`: Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
- `STRIPE_START_PRICE_ID`: recurring Stripe price for Start plan.
- `STRIPE_BUSINESS_PRICE_ID`: recurring Stripe price for Business plan.
- `STRIPE_ENTERPRISE_PRICE_ID`: recurring Stripe price for Enterprise plan.

## Backend Requirement

The FastAPI backend is not deployed by this Vercel frontend project. It needs its own runtime such as Render, Railway, Fly.io, a VPS, or a separate Vercel Python project. After deploying it, set `NEXT_PUBLIC_API_URL` to that backend URL.

Run backend migrations before production traffic:

`python -m alembic upgrade head`

Current required database tables include:

- `crm_inquiries`
- `billing_events`
- `rag_audit`
- `image_results`

## Stripe Webhook

Configure the Stripe webhook endpoint on the backend:

`POST {FASTAPI_BASE_URL}/payments/webhook`

At minimum, listen for:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Smoke Tests After Deploy

- Open `/` and verify the landing page renders.
- Open `/crm` and confirm it shows either live CRM records or the clear backend unavailable fallback.
- Call `{NEXT_PUBLIC_API_URL}/health` and confirm `{"status":"ok"}`.
- Submit a CRM inquiry and confirm it appears in `crm_inquiries`.
- Test `/api/ai` with a short prompt and confirm OpenAI responds.
- Start a Stripe checkout from `/pricing` and confirm it redirects to Stripe Checkout.

## Known Notes

- Next dev should use webpack mode on this Windows/OneDrive setup because Turbopack dev was observed listening without returning HTTP responses.
- Next reports that `middleware.ts` convention is deprecated in favor of `proxy`; this is not blocking production build but should be migrated later.
