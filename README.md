# Talk CMS

Talk is an experimental headless CMS designed for seamless integration with ChatGPT by OpenAI for automatic landing page creation. It is inspired by Storyblok, a popular headless CMS, and aims to provide a user-friendly way to build and manage content for your web projects.

![Talk CMS](preview.png "Talk CMS")
![Talk CMS](preview_dark.png "Talk CMS dark mode")

## Features

- Headless CMS with a visual editor
- Integration with ChatGPT for automatic landing page generation
- Modular block-based content structure
- Extensible and customizable to suit your needs
- TanStack Start server rendering and file-based API routes

## Getting Started

### Prerequisites

- Node.js 24 (Node.js 22.22.2 remains supported)
- pnpm 11.1.2
- Docker with Docker Compose
- A modern web browser

The supported Node.js versions include the requirements of TanStack Start, Vite,
ESLint, and jsdom. The Docker image uses Node.js 24.

### Installation

1. Clone the repository and enter it:

```sh
git clone https://github.com/your-username/talk-cms.git
cd talk-cms
```

2. Install dependencies with pnpm:

```sh
pnpm install
```

3. To use the block-builder API, create `.env.local` in the project root:

```dotenv
VITE_VISUAL_COMPOSER_URL=https://your-preview-site.example?editMode=true
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_optional_openai_organization_id
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
MONGODB_URI=mongodb://talk-app:talk-app-local-only@localhost:27017/talk_cms?authSource=talk_cms
MONGODB_DATABASE=talk_cms
```

`VITE_VISUAL_COMPOSER_URL` controls the site shown in the visual-composer iframe.
When it is omitted or invalid, the preview area remains empty. The OpenAI and
Unsplash values are only used by `/api/internal/block-builder`. MongoDB is
used independently by `POST /api/internal/pages` when the editor's Save action runs.
Copy `.env.example` to `.env.local` for the complete local configuration.
When `.env.local` is absent, the development server uses the documented local
Compose MongoDB URI. Production always requires an explicit `MONGODB_URI`.

### Development

```sh
pnpm dev
```

The server listens on [http://localhost:3000](http://localhost:3000).

The TanStack Start app and API routes are defined in `src/routes`.

## Defining blocks

Navigate to `/blocks` or select **Block definitions** in the application bar.
This page lets content teams create, edit, and remove their own block models,
including text, long text, URL, color, number, and toggle fields. There are no
hard-coded block definitions; a fresh installation starts with an empty library.

Definitions are stored as JSON in `data/block-definitions.json` and compiled
into strict Zod schemas at runtime. The page editor and AI block builder consume
the same definitions, defaults, validation rules, and nested-block policies.
The UI is served by the `/blocks` page route, while JSON CRUD remains separate
under `/api/internal/block-definitions`.

### Validation

```sh
pnpm lint
pnpm typecheck
pnpm test
MONGODB_URI=mongodb://talk-app:talk-app-local-only@localhost:27017/talk_cms?authSource=talk_cms pnpm test:mongodb
pnpm test:e2e
pnpm build
```

### Production

```sh
pnpm start
```

The start command builds the application and launches the production entry point
at `.output/server/index.mjs` on port 3000.

### Docker

Build and run the production image with Docker Compose:

```sh
docker compose up --build
```

Compose starts MongoDB 8.0.29 with authentication, waits for its health check,
and stores database files in the `mongodb-data` named volume. The application
uses a database-scoped `readWrite` user over the private Compose network; the
root user is reserved for initialization and health checks. Supply a complete,
percent-encoded `MONGODB_URI` when overriding credentials. The host port is bound
to `127.0.0.1:27017` for local tools and integration tests.

Mongo initialization variables are applied only when `mongodb-data` is empty.
For disposable local data, credential changes can be applied with
`docker compose down` followed by `docker volume rm talk-cms_mongodb-data`. For
retained data, rotate users inside MongoDB before changing Compose variables;
never remove a volume that contains data you need.

## Routes

### App Routes

App UI files live in the pathless `src/routes/(app)` route group. The group keeps
the browser-facing URLs unchanged:

- `/` serves the page editor.
- `/blocks` serves block-definition management.

### Internal Backend API

The internal API is unstable and intended only for the Talk CMS application.
It may change together with the editor without public compatibility guarantees:

- `GET`, `POST`, `PUT`, and `DELETE /api/internal/block-definitions` manage block definitions.
- `POST /api/internal/block-builder` generates validated, flattened page blocks.
- `POST /api/internal/pages` validates and persists the editor's current page.
- `GET /api/internal/hello` returns `{ "name": "John Doe" }`.

### Public Content API

The versioned content API is intended for end-user websites consuming saved CMS
content:

- `GET /api/content/v1/pages/:pageId` returns a saved page by ID, or a 404 response
  when no page has that ID.

Pages saved by content creators are stored in MongoDB's `pages` collection before
the endpoint responds. Each document contains a UUID, the validated flattened
blocks, and a creation timestamp. Page persistence does not require OpenAI. If
persistence fails, the endpoint returns an error instead of reporting success.
Saved pages are currently readable immediately through the public content API;
draft/published gating has not been introduced yet.

## Contributing

If you'd like to contribute to the Talk CMS project, please open an issue or submit a pull request on the GitHub repository.

## License

Talk CMS is licensed under the [MIT License](LICENSE).
