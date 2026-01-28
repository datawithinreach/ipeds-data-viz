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
