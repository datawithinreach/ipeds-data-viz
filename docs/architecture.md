# Architecture

## Directory Structure

```
ipeds-data-viz/
├── app/                    # Pages, Components, and API routes
│   ├── api/                # Backend endpoints (GET, POST, etc.)
│   └── ./                  # Frontend pages
├── components/             # UI components
├── lib/                    # Shared utility functions
├── types/                  # Shared TypeScript types
└── docs/                   # Documentation
```

## Key Conventions

- **Backend**: `app/api/` — all API route handlers
- **Frontend**: `app/` - for pages, `components/` for specific UI components
- **Types**: `types/` — shared between frontend and backend
