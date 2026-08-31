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
```

`VITE_VISUAL_COMPOSER_URL` controls the site shown in the visual-composer iframe.
When it is omitted or invalid, the preview area remains empty. The OpenAI and
Unsplash values are only read when `/api/block-builder` handles a request and
are not required to run or test the rest of the application.

### Development

```sh
pnpm dev
```

The server listens on [http://localhost:3000](http://localhost:3000).

The TanStack Start home and API routes are defined in `src/routes`.

## Defining blocks

Navigate to `/blocks` or select **Block definitions** in the application bar.
This page lets content teams create, edit, and remove their own block models,
including text, long text, URL, color, number, and toggle fields. There are no
hard-coded block definitions; a fresh installation starts with an empty library.

Definitions are stored as JSON in `data/block-definitions.json` and compiled
into strict Zod schemas at runtime. The page editor and AI block builder consume
the same definitions, defaults, validation rules, and nested-block policies.
The UI is served by the `/blocks` page route, while JSON CRUD remains separate
under `/api/block-definitions`.

### Validation

```sh
pnpm lint
pnpm typecheck
pnpm test
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

An `.env.local` file is optional for startup and required only when using the OpenAI/Unsplash-backed block builder.

## API Routes

- `GET /api/hello` returns `{ "name": "John Doe" }`.
- `POST /api/block-builder` accepts `{ "input": ... }` and returns flattened page blocks, a validation error with status 400, or the existing generic processing error with status 500.

## Contributing

If you'd like to contribute to the Talk CMS project, please open an issue or submit a pull request on the GitHub repository.

## License

Talk CMS is licensed under the [MIT License](LICENSE).
