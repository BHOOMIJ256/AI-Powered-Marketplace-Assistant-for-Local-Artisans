## AI-Powered Marketplace Assistant for Local Artisans

An MVP web platform that helps artisans showcase products, sell online, and grow their digital presence with AI-generated storytelling, AR try-on, analytics, and multilingual support.

### Key Features
- AI Storytelling: Generate product title, description, social caption, and hashtags from an image + optional voice note/text via Python FastAPI (Google Speech + Gemini).
- AR Try-On: Launch a local AR session to visualize products via Python Flask backend.
- Commerce: Products, orders, and stock management with buyer/ artisan flows.
- Insights: Customer analytics, pricing suggestions, and geo heatmap from orders.
- Multilingual UX: Dynamic translation via Google Cloud Translate; language switcher.
- Schemes Hub: Curated government schemes for artisans with benefits and eligibility.
- Authentication: Separate sessions for buyer and artisan, cookie-based.

### Tech Stack
- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- Backend (Node): Next.js API Routes, Prisma ORM (SQLite)
- AI Services (Python): FastAPI for storytelling, Flask for AR try-on
- Cloud/SDKs: Google Cloud Speech-to-Text, Google Generative AI (Gemini), Google Translate API

---

## Architecture Overview

```mermaid
flowchart TD
  subgraph Browser
    UI[Next.js Pages & Components]
    Lang[Language Selector]
    ARBtn[AR Try-On Button]
    StoryTool[Story Generator UI]
  end

  subgraph Next.js (Node)
    APIAuth[/api/auth, /api/login, /api/logout, /api/buyer/*/]
    APIProducts[/api/products]
    APIOrders[/api/orders, /api/orders/:id/complete]
    APIPosts[/api/posts]
    APIInsights[/api/insights/*]
    APISchemes[/api/schemes]
    APITranslate[/api/translate]
    APIStory[/api/storytelling]
    APIAR[/api/ar-tryon]
    Prisma[(Prisma + SQLite)]
  end

  subgraph Python Services
    FastAPI[FastAPI: /generate-story]
    Flask[Flask: /api/ar-tryon]
    ARScript[[center_virtual_tryon.py]]
  end

  UI -->|fetch| APIProducts
  UI -->|fetch| APIOrders
  UI -->|fetch| APIPosts
  UI -->|fetch| APIInsights
  Lang -->|POST text(s)| APITranslate
  StoryTool -->|multipart image+audio/note| APIStory --> FastAPI
  ARBtn -->|image URL| APIAR --> Flask --> ARScript
  API* --> Prisma
```

---

## Monorepo Layout
- `src/app` UI pages for buyer, artisan dashboard, insights, marketing, finance support, etc.
- `src/app/api` Next.js API routes for auth, products, orders, posts, insights, schemes, storytelling, AR try-on, translate.
- `src/lib` Shared server utilities: `db.ts`, `auth.ts`, `translate.ts`, `translations.ts`, `i18n.ts`, `sms.ts`, `validations.ts`.
- `prisma` Prisma schema and migrations (SQLite default).
- `ai_backend` Python services: `main.py` (FastAPI storytelling), `AR_backend.py` (Flask AR), `center_virtual_tryon.py` runner.
- `scheme_scraper` Scraper (future integration) and `scraped_schemes.json`.
- `public/uploads` Product image uploads.

---

## Who This Helps (Personas & User Journeys)

- Artisan (Seller)
  - Onboarding: Registers with basic profile, craft, and location. Gets `session_user` cookie.
  - Catalog: Creates products (name, description, price, stock, image). Images are stored under `public/uploads/products`.
  - Storytelling: Uses `StoryTool` to upload a product photo and optionally a voice note or typed note. The Python FastAPI service generates a title, description, caption, and hashtags; artisan can save to posts or copy content for social.
  - AR Try-On: Triggers a local AR session for a product to preview scale/placement (desktop demo). Useful for photoshoots or customer demos.
  - Orders: Views incoming orders, marks them complete, which triggers SMS to buyers; stock is automatically decremented.
  - Insights: Views pricing suggestions, seasonal demand, top regions/products, and buyer preferences to inform production and pricing.
  - Finance & Support: Browses curated government schemes and benefits.

- Buyer
  - Onboarding: Registers quickly with name, phone, city/state. Gets `session_buyer` cookie.
  - Browse & Purchase: Views product list, adds to cart (MVP: single artisan per order), places an order providing address.
  - Notifications: Receives SMS notification once an order is marked complete by the artisan.

- Admin/Future
  - Manage schemes via scraper/curation; manage artisans and flagged content; advanced analytics.

---

## Data Model (Prisma)
Tables: `users`, `products`, `orders`, `order_items`, `posts`.
- `User`: name, phone (unique), optional email, role: `artisan | buyer`, location, artisan fields (craftType, experience, languages JSON), flags.
- `Product`: name, description, price (int), stock, imageUrl, `artisanId`.
- `Order`: buyerId, artisanId, status, totalAmount, address, buyerCity/State, items.
- `OrderItem`: orderId, productId, quantity, unitPrice snapshot.
- `Post`: AI story content per user: title, description, caption, hashtags (JSON string), imageUrl, userId.

---

## API Surface (Selected)
- Auth
  - `POST /api/auth` Register artisan (validates via Zod, hashes password, sets `session_user`).
  - `POST /api/login` Login artisan; sets `session_user`.
  - `POST /api/buyer/register` Register buyer; sets `session_buyer`.
  - `POST /api/buyer/login` Login buyer; sets `session_buyer`.
  - `GET /api/auth/check` Detect active session and role.
  - `GET /api/buyer/check-auth` Verify buyer session.
  - `POST /api/logout` Clear sessions.

- Commerce
  - `GET /api/products` List products with artisan.
  - `POST /api/products` Create product with optional image upload (saved to `public/uploads/products`).
  - `POST /api/orders` Place order for items from a single artisan; decrements stock; SMS notify artisan.
  - `POST /api/orders/:id/complete` Mark order completed; SMS notify buyer.

- Content & AI
  - `POST /api/posts` Create AI post record (hashtags array stored as JSON string).
  - `GET /api/posts?userId=...` List posts for user.
  - `POST /api/storytelling` Forwards multipart to FastAPI `/generate-story`; returns structured content.
  - `POST /api/ar-tryon` Proxies to Flask to launch local AR try-on session.
  - `POST /api/translate` Google Translate single or multiple texts.

- Insights & Schemes
  - `GET /api/insights/customer` Top regions, top products, buyer preferences, AOV, repeat customers.
  - `GET /api/insights/locations` 30-day geo buckets for heatmap.
  - `GET /api/insights/pricing-trends` Seasonal demand + per-product pricing suggestions.
  - `GET /api/schemes` Curated government schemes (future: scraper integration).

---

## Features in Depth

- Authentication & Sessions
  - Separate roles and cookies: `session_user` for artisans, `session_buyer` for buyers.
  - Login restriction by role enforces correct portal entry points.
  - `GET /api/auth/check` returns role-scoped session status for gating UI.

- Product Management
  - Image uploads via multipart handled server-side, saved with unique filenames. Public path is returned for rendering and AR.
  - Stock and price tracked per product, with order flow decrementing inventory.

- Orders & Fulfillment
  - Order placement validates single-artisan constraint in MVP to simplify settlement and messaging.
  - Atomic creation via transaction: order, items, stock decrement.
  - SMS notifications sent to artisan on new order; on completion, buyer receives SMS confirmation.

- AI Storytelling (Image + Audio/Text)
  - FastAPI uses Google Speech-to-Text for voice notes, extracting transcription with confidence.
  - Google Generative AI (Gemini) produces structured JSON: title, description, caption, hashtags, with fallback parsing for resilience.
  - The Next.js proxy normalizes responses and surfaces processing info (e.g., audio used, model, confidence).
  - Failure modes: missing credentials, large models, or connectivity issues return clear error messages; UI can retry or proceed with manual content.

- AR Try-On (Local Desktop Demo)
  - Flask backend launches `center_virtual_tryon.py` to open a window with webcam feed and overlay the product image.
  - API accepts a product image URL; relative URLs are converted to absolute using `NEXT_PUBLIC_BASE_URL`.
  - Includes controls and session status endpoints; primarily a developer/demo aid for MVP.

- Multilingual UX
  - Dynamic translation via Google Translate service. Static keys kept in English source; the API translates on demand.
  - Simple in-memory cache avoids repeated calls for identical inputs.

- Insights & Pricing
  - Customer Insights: top regions (by orders/sales), top products (by revenue), buyer preferences (price ranges, inferred categories), seasonal trends, AOV, repeat customers.
  - Pricing Trends: realized price distributions and demand momentum (30d vs 90d) produce a suggested price with clear rationale per product.

- Government Schemes Hub
  - Curated list sourced from Indian Handicrafts Portal with benefits, eligibility, and links. Future: dynamic scraper and admin tooling.

---

## End-to-End Flows (Sequences)

Story Generation
1) Artisan opens StoryTool and selects a photo, records a brief audio note (optional), or types a note.
2) Frontend sends multipart to `POST /api/storytelling`.
3) Next.js forwards to FastAPI `/generate-story`.
4) FastAPI transcribes audio (if any) using Google Speech, then calls Gemini with image+context.
5) Structured content returned to Next.js; UI displays title/description/caption/hashtags. User can save to `posts` via `POST /api/posts`.

Order Placement
1) Buyer logs in, adds products (same artisan) to cart, and checks out with address.
2) `POST /api/orders` validates items, groups by artisan, computes totals, decrements stock in a transaction.
3) SMS is sent to the artisan with order ID and buyer location snippet.
4) Artisan completes order via dashboard → `POST /api/orders/:id/complete`; buyer gets SMS.

---

## Environment Variables

| Name | Used By | Required | Notes |
| --- | --- | --- | --- |
| DATABASE_URL | Next.js | Yes | `file:./dev.db` for SQLite by default |
| NEXT_PUBLIC_BASE_URL | Next.js | Dev | e.g. `http://localhost:3000` for AR URL rewriting |
| GOOGLE_APPLICATION_CREDENTIALS | Next.js/Python | If translate/speech used | Path to service account JSON |
| GOOGLE_PROJECT_ID | Next.js | If translate used | Must match credentials project |
| STORYTELLING_API_URL | Next.js | Dev | Default `http://localhost:8000` |
| AR_BACKEND_URL | Next.js | Dev | Default `http://localhost:8002` |
| GOOGLE_API_KEY | Python (FastAPI) | If Gemini used | Key for Generative AI |

---

## Example Requests

Translate
```bash
curl -X POST http://localhost:3000/api/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Welcome","targetLanguage":"hi"}'
```

Create Product (multipart)
```bash
curl -X POST http://localhost:3000/api/products \\
  -H "Cookie: session_user=<artisan_id>" \\
  -F name="Handwoven Scarf" \\
  -F description="Soft cotton scarf" \\
  -F price=1299 -F stock=5 \\
  -F image=@./scarf.jpg
```

Place Order
```bash
curl -X POST http://localhost:3000/api/orders \\
  -H "Content-Type: application/json" \\
  -H "Cookie: session_buyer=<buyer_id>" \\
  -d '{"items":[{"productId":"<id>","quantity":1}],"address":"123 Street, City"}'
```

Storytelling (multipart)
```bash
curl -X POST http://localhost:3000/api/storytelling \\
  -F image=@./vase.png \\
  -F audio=@./note.m4a \\
  -F note="Blue pottery from Jaipur"
```

Start AR Try-On
```bash
curl -X POST http://localhost:3000/api/ar-tryon \\
  -H "Content-Type: application/json" \\
  -d '{"productImageUrl":"/uploads/products/example.jpg"}'
```

---

## Developer Workflows

- Database
  - Generate: `npx prisma generate`
  - Migrate: `npx prisma migrate dev` (local) or `migrate deploy` (deploy)
  - Inspect: `npx prisma studio`

- Seeding & Assets
  - Use `scripts/create-sample-products.js` and `scripts/add-sample-images.js` for demo data.

- AI/AR Services
  - Run FastAPI: `python ai_backend/main.py`
  - Run Flask AR: `python ai_backend/AR_backend.py`
  - Configure `STORYTELLING_API_URL` and `AR_BACKEND_URL` if not default.

- Translations
  - Static keys live in `src/lib/translations.ts` (English). Other languages resolved via `/api/translate`.

---

## Security & Privacy

- Credentials
  - Do not commit keys. Use `.env.local` and separate `.env` for Python with `.gitignore` protection.
  - Service account JSON should be stored securely (local dev path only).

- Authentication
  - Cookie sessions per role (httpOnly, sameSite=lax, secure in production). Consider rotating secrets and adding CSRF tokens for forms if extending.

- PII & Content
  - Stores phone, address (orders). Limit access to relevant roles and redact logs in production.
  - Uploaded images are public. For private workflows, move to signed URLs or restricted storage.

- AI Data Handling
  - Audio/image content is processed locally then sent to Google services where applicable. Document data retention and provide an opt-out in production.

---

## Performance & Limits

- SQLite is ideal for local/dev MVP; move to Postgres/MySQL for concurrency, relations, and analytics at scale.
- AI generation latency: 2–30s depending on model and hardware; add background jobs for larger batches.
- Translation API calls are cached per text+language in-memory; for scale, adopt Redis.
- AR try-on is a local demo; for production, consider WebAR or native mobile SDKs.

---

## Roadmap

- Short-term
  - Admin panel for schemes, content moderation, and analytics.
  - Multi-artisan carts and payments integration (Razorpay/Stripe) with order settlement.
  - Media management: gallery, CDN, and generated social tiles.

- Medium-term
  - Better personalization: buyer preferences, recommendations, and repeat purchase nudges.
  - Advanced AR: web-based try-on, body/room anchoring, scale estimation.
  - Offline/low-connectivity flows and SMS ordering.

- Long-term
  - Multi-language content authoring with human-in-the-loop editing.
  - Marketplace network effects: fairs/exhibitions calendar, bulk orders, B2B channels.

---

## Setup

### Prerequisites
- Node.js 18+, npm 9+
- Python 3.10+

### 1) Install and generate Prisma client
```bash
npm ci
npx prisma generate
```

Set database (SQLite by default):
```
DATABASE_URL="file:./dev.db"
```

Apply migrations (optional for fresh DB):
```bash
npx prisma migrate deploy
```

### 2) Environment Variables (Next.js)
Create `.env.local`:
```
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Google Translate (service account JSON path; see GOOGLE_TRANSLATE_SETUP.md)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_PROJECT_ID=story-telling-project-470510
```

Place `google-credentials.json` at repo root for `@google-cloud/translate` if needed.

### 3) Run Next.js
```bash
npm run dev
```

### 4) Python AI Storytelling Service
```bash
cd ai_backend
pip install -r ../requirements.txt  # or python -m pip install -r ../requirements.txt
python main.py
```
Environment for Python FastAPI:
```
GOOGLE_APPLICATION_CREDENTIALS=./path/to/speech-service-account.json
GOOGLE_API_KEY=your_gemini_api_key
```
Service runs at `http://localhost:8000`.

### 5) Python AR Try-On Service
```bash
cd ai_backend
pip install -r ../requirements.txt
python AR_backend.py
```
Service runs at `http://localhost:8002` and spawns `center_virtual_tryon.py`.

---

## Frontend Pages (Highlights)
- Public: `src/app/page.tsx`, `src/app/about/page.tsx`, buyer login/signup.
- Buyer: `src/app/buyer/page.tsx`, order placement.
- Artisan Dashboard: `src/app/dashboard/*` (products, orders, insights, pricing, marketing, finance-support).
- Artisan Profile: `src/app/artisan/[id]/*` with `StoryTool.tsx` for AI content.
- Language: `src/components/LanguageSelector.tsx`, `TranslatedText.tsx` using `/api/translate`.

---

## Developer Notes
- Sessions: cookies `session_user` (artisan) and `session_buyer` (buyer).
- Image uploads: stored under `public/uploads/products`; API computes unique filename.
- SMS: `src/lib/sms.ts` placeholders for order notifications.
- Validation: `src/lib/validations.ts` (Zod) used in `POST /api/auth`.
- Scripts: `scripts/create-sample-products.js`, `scripts/add-sample-images.js` for demo data.

---

## Common Commands
```bash
npm run dev           # start Next.js
npm run build         # production build
npm run start         # start production server
npx prisma studio     # open Prisma Studio
```

---

## Troubleshooting
- Translation errors: verify `google-credentials.json` path and project ID in `src/lib/translate.ts`.
- Storytelling 503: ensure `ai_backend/main.py` is running and `STORYTELLING_API_URL` points to it.
- AR 503: ensure `ai_backend/AR_backend.py` is running and `AR_BACKEND_URL` is configured.
- SQLite lock: close other processes, or switch to MySQL/Postgres by updating `schema.prisma` and `DATABASE_URL`.

---

## License
MVP for hackathon use; add a proper license before public release.