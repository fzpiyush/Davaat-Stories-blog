# Davaat Stories

Davaat Stories is a personal publishing website for long-form blog posts and
serialized fiction. It includes a public reading experience, a passwordless
Google sign-in flow, and an administration area for managing content and
readers.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Application structure](#application-structure)
- [Routes](#routes)
- [Data model](#data-model)
- [Authentication and access](#authentication-and-access)
- [Environment configuration](#environment-configuration)
- [Local development](#local-development)
- [Database migrations and seed data](#database-migrations-and-seed-data)
- [Useful commands](#useful-commands)
- [Deployment notes](#deployment-notes)

## Features

### Public website

- Home page with a hero, featured and latest blogs, stories, and newsletter
  signup.
- Paginated blog and serialized-story indexes.
- Blog articles with rich sections, reading-time metadata, author information,
  related/recommended posts, and previous/next navigation.
- Story overviews and chapter reader pages with chapter navigation.
- About page backed by editable author, about-page, social-link, and media data.
- Reader comments and replies, likes, and daily-deduplicated page views.
- Light/dark theme support, responsive layouts, metadata, and social sharing
  metadata.

### Administration

The `/admin` area provides management screens for:

- Blogs and serialized stories, including chapters.
- Categories, tags, featured content, and blog recommendations.
- Media uploads and alternative text.
- Comments and readers, including hiding/removing comments and blocking readers.
- Newsletter subscribers.
- Author profile, About page, and site social links.

Content can be saved as a draft, published, or scheduled. Published content is
validated for the fields required by the public site, and public content pages
revalidate every 60 seconds.

## Technology

- **Framework:** Next.js 16 App Router with React 19 and TypeScript.
- **Styling:** Tailwind CSS 4, with project styles in `src/app/globals.css`.
- **Database:** PostgreSQL, accessed through Knex.
- **Media storage:** Supabase Storage; upload URLs are issued by server actions.
- **Authentication:** Google OAuth 2.0 / OpenID Connect with PKCE and
  database-backed sessions.
- **Validation:** Zod schemas for content and form inputs.
- **Icons:** Heroicons and React Icons.

## Application structure

```text
src/
  app/
    (public)/       Public-facing pages and shared public layout
    (admin)/        Admin pages, login, and shared admin layout
    api/auth/       Google OAuth start and callback handlers
  components/
    admin/          Admin navigation, forms, editors, and management UI
    blog/           Blog cards, articles, and navigation
    engagement/     Likes, comments, and view tracking UI
    home/           Home page sections
    public/         Shared public-site UI
    story/          Story overview and chapter reader UI
  lib/
    admin/          Server actions and admin form/content rules
    auth/           OAuth, sessions, cookies, and access checks
    db/             Knex connection, typed rows, and database queries
    blog/ story/    Public content queries and view types
    comments/       Reader comment actions and formatting
    engagement/     Like/view actions and visitor identity
    media/ storage/ Image processing and Supabase clients
    validation/     Zod schemas
db/
  migrations/       PostgreSQL schema migrations
  seeds/            Optional sample content
```

The public and admin route groups are Next.js route groups: their names in
parentheses do not appear in the URL. Server Components load most page data
directly through query modules in `src/lib`; server actions handle mutations.
Database access is server-only. The admin proxy checks for a session cookie,
and protected operations also call `requireAdmin()` to validate the session
and administrator allowlist.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/blogs` | Paginated blog index |
| `/blogs/[slug]` | Blog article |
| `/stories` | Paginated story index |
| `/stories/[slug]` | Story overview and chapter list |
| `/stories/[slug]/[number]` | Individual chapter |
| `/about` | Author and site information |
| `/login` | Google sign-in page |
| `/api/auth/google` | Starts the Google OAuth flow |
| `/api/auth/google/callback` | Handles the OAuth response |
| `/admin` | Admin dashboard (requires administrator access) |
| `/admin/blogs`, `/admin/stories`, etc. | Content and site-management pages |

## Data model

The PostgreSQL schema is defined by the migrations in `db/migrations`.

| Area | Tables and relationships |
| --- | --- |
| Accounts | `users` stores Google identities and `admin`/`reader` roles; `sessions` stores hashed session identifiers and expiry times. |
| Publishing | `blogs` contain JSONB content sections; `stories` contain story metadata and `chapters` contain numbered chapter text. Both content types support draft, published, and scheduled states. |
| Taxonomy | `categories` and `tags` are linked to blogs and stories through `blog_tags` and `story_tags`. |
| Author and assets | `authors` holds the author profile; `media` holds image metadata and URLs/storage paths. Posts, stories, authors, and the About page can reference media records. |
| Blog recommendations | `blog_recommendations` links one blog to other blogs with an ordering position. |
| Engagement | `comments` can target one blog or one story and can be threaded; `likes` target one blog or story; `page_views` record blog or chapter views. |
| Site information | `about_page` is constrained to one row; `social_links` stores ordered links for supported platforms. |
| Newsletter | `newsletter_subscribers` stores unique email addresses and subscription status. |

Database constraints enforce important invariants, including one featured blog
and one featured story at a time, unique chapter numbers within a story,
positive chapter numbers, and a single target for each comment/like/view.
Visitor identifiers used for engagement are stored as hashes in the database;
the browser cookie itself is HTTP-only.

## Authentication and access

Google sign-in creates or updates a user account. An email is given the
administrator role only when it appears in `ADMIN_EMAILS`; other Google users
are readers. Google email verification is required. The OAuth flow uses a
state value and PKCE verifier stored in short-lived, HTTP-only cookies.

Sessions last 30 days. The browser receives a random session token while the
database stores its SHA-256 hash. Administrator access additionally checks the
user role and the current email allowlist. Readers can use reader features but
cannot access the admin area; reader accounts can be blocked by an admin.

## Environment configuration

Create a local `.env.local` file with the values for your own development
environment. Do not commit credentials or service-role keys. The application
expects:

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Application PostgreSQL connection (Supabase transaction pooler in the configured deployment). |
| `MIGRATION_DATABASE_URL` | Development Knex migrations and seeds (Supabase session pooler). |
| `PRODUCTION_MIGRATION_DATABASE_URL` | Production Knex migrations and seeds. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL; configure it to point to `/api/auth/google/callback`. |
| `ADMIN_EMAILS` | Comma-separated administrator email allowlist. Values are normalized to lowercase. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, used by server and browser storage clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key used by the browser client for signed uploads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used to create upload links and manage stored files. |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket used for uploaded media. |

The Knex configuration loads `.env.local` directly for migration and seed
commands. The running Next.js app reads the runtime variables from its normal
environment configuration. The service-role key must never be exposed to
browser code.

## Local development

1. Install Node.js and npm, then install the locked dependencies:

   ```bash
   npm ci
   ```

2. Configure the required environment variables in `.env.local`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000).

The application needs a configured PostgreSQL database for data-backed pages
and actions. Configure the Google OAuth client with the local callback URL
`http://localhost:3000/api/auth/google/callback` when testing sign-in locally.
Public pages can be read without signing in; admin features require an allowlisted
Google account.

## Database migrations and seed data

Knex migrations live in `db/migrations` and are run in timestamp order. Use
`npm run db:migrate` for the current environment, or `npm run db:rollback` to
roll back the latest migration. `npm run db:make -- <migration-name>` creates
a TypeScript migration. `npm run db:seed` runs the seed files.

Seed files are optional and are designed to skip inserting duplicate sample
content. `01_mock_content.ts` creates sample blogs and supporting author,
category, tag, and media records when the blogs table is empty.
`02_sample_story.ts` creates “The Lantern Keeper” and its sample chapters when
that story slug does not already exist.

**Migration-history note:** both
`20260922120628_create_categories_table.ts` and
`20261005120154_create_categories_and_tags.ts` create a `categories` table.
Knex runs both files in timestamp order, so check the target database's
`knex_migrations` state and reconcile the schema history before running the
full migration chain on a fresh or partially migrated database. Do not edit a
migration that has already been applied to a shared database; use a new
forward migration for schema changes.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:rollback` | Roll back the latest migration batch |
| `npm run db:make -- <name>` | Create a TypeScript migration |
| `npm run db:seed` | Run database seeds |

## Deployment notes

- Set the production runtime variables in the hosting provider; do not ship
  `.env.local`.
- Set `NODE_ENV=production` so cookies are marked secure.
- Configure the Google OAuth redirect URI to the production callback URL and
  keep the allowlisted administrator emails current.
- Use the runtime database URL for the application and the migration URL for
  schema operations; the configured Supabase pooler ports differ by workload.
- Ensure the Supabase Storage bucket and policies support the application's
  signed-upload flow.
- Apply and verify database migrations before deploying code that depends on
  new schema.
- Public content pages use one-minute revalidation so scheduled content and
  edits appear without a redeploy.
