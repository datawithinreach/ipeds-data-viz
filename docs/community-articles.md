# Community Articles

This feature allows authenticated users to generate data stories from IPEDS admissions data using OpenAI, submit them for admin review, and have approved articles appear on the landing page alongside editorial content.

## Architecture

### Authentication

- **Firebase Auth** handles user accounts (email/password + Google sign-in).
- Session cookies are created via `/api/auth/session` after login and verified server-side using the Firebase Admin SDK.
- Admin status is determined by the `ADMIN_EMAILS` environment variable (comma-separated list of email addresses). A Firebase custom claim `{ admin: true }` is set on first login for matching emails so Firestore rules can also enforce it.

### Article Generation

1. User visits `/generate` and selects parameters:
   - Institutions (1–10 from the ~6,000 in `data/institution_ids.json`)
   - Data variables (1–8 from `data/2024/admissions/adm_variables2024.json`)
   - Chart type, angle, tone, length, audience, and an optional custom question
2. The form POSTs to `/api/articles/generate`, which:
   - Validates parameters with Zod
   - Builds a "data brief" from the local IPEDS JSON files (real numbers, descriptions)
   - Calls OpenAI with `response_format: { type: 'json_schema' }` to get structured JSON
3. The response is returned to the client for preview (not saved yet).
4. The user can edit the title, slug, description, and tags before submitting.

### Storage

- Articles are stored in Firestore collection `articles` with schema defined in `lib/articles/types.ts`.
- Chart data values are **not** stored in Firestore. Instead, chart specs (institution names + variable codes) are stored, and values are hydrated at render time from the local IPEDS JSON.
- The `slug` field is unique and validated against reserved slugs (static article folders, route names).

### Admin Workflow

- Admins visit `/admin` to see pending articles.
- Each article can be reviewed at `/admin/article/{id}` with approve/reject actions.
- Approved articles appear on the landing page with a "Community" badge and are accessible at `/article/{slug}`.

### Routing

- Static editorial articles (`app/article/admissions-top-20/`, etc.) take priority over the dynamic `app/article/[slug]/` route.
- The dynamic route only fires for community article slugs and calls `getApprovedBySlug()` from Firestore.

## Environment Variables

See `.env.example` for the full list:

- `NEXT_PUBLIC_FIREBASE_API_KEY` / `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Firebase client config
- `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` — JSON string of your Firebase service account key
- `OPENAI_API_KEY` — OpenAI API key
- `ADMIN_EMAILS` — comma-separated admin email addresses

## Files

### Library

- `lib/firebase/client.ts` — Firebase client init
- `lib/firebase/admin.ts` — Firebase Admin SDK init
- `lib/auth/admin.ts` — Admin helpers (isAdminEmail, requireAuth, requireAdmin)
- `lib/articles/types.ts` — TypeScript types
- `lib/articles/communityArticles.ts` — Firestore CRUD
- `lib/articles/reservedSlugs.ts` — Slug validation
- `lib/articles/validationSchemas.ts` — Zod schemas
- `lib/articles/hydrateChartData.ts` — Chart data hydration from IPEDS JSON
- `lib/openai/generateArticle.ts` — OpenAI structured generation

### Components

- `components/auth/AuthProvider.tsx` — Firebase auth context
- `components/auth/useAuth.ts` — Auth hook
- `components/auth/RequireAuth.tsx` — Auth gate component
- `components/article/CommunityArticleBody.tsx` — Renders community article JSON
- `components/layout/NavbarAuth.tsx` — Auth UI in navbar

### Routes

- `/login`, `/signup` — Auth pages
- `/generate` — Parameter selection form
- `/generate/preview` — Preview and submit
- `/admin` — Pending article queue (admin only)
- `/admin/article/[id]` — Review page (admin only)
- `/article/[slug]` — Dynamic community article page

### API Routes

- `POST /api/auth/session` — Create session cookie
- `POST /api/auth/logout` — Clear session cookie
- `POST /api/articles/generate` — Generate article via OpenAI
- `POST /api/articles` — Save article as pending
- `GET /api/admin/articles` — List pending / get by ID (admin only)
- `POST /api/admin/articles/[id]/approve` — Approve article (admin only)
- `POST /api/admin/articles/[id]/reject` — Reject article (admin only)
