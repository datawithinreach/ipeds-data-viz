# Getting Started

Instructions for setting up the project locally for development.

## Prerequisites

- **Node.js** v20.9.0 or higher ([download](https://nodejs.org/))
- **pnpm** v9.x or higher ([installation guide](https://pnpm.io/installation))

To verify your versions:

```bash
node -v   # Should output v20.9.0 or higher
pnpm -v   # Should output 9.x.x or higher
```

To install pnpm if you don't have it:

```bash
npm install -g pnpm@latest
```

## Tech Stack Versions

| Package      | Version |
| ------------ | ------- |
| Next.js      | 16.1.4  |
| React        | 19.2.3  |
| TypeScript   | 5.x     |
| Tailwind CSS | 4.x     |

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ipeds-data-viz.git
cd ipeds-data-viz
```

2. Install dependencies:

```bash
pnpm install
```

## Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Code Quality

This project uses ESLint and Prettier to maintain consistent code style.

```bash
pnpm lint          # Check for linting errors
pnpm lint:fix      # Auto-fix linting errors
pnpm format        # Auto-format all files (based on .prettierrc)
```

**Note**: If run into git commit or git push errors, run these commands.
Enable **Format on Save** in your editor with the Prettier extension to auto-format as you work.
