# Bluflare

Bluflare is an application that monitors the Bluesky Firehose via their Jetstream websocket service to track and analyze posts about specific subjects of interest.

## Features

- Track and filter Bluesky posts based on custom keywords
- Real-time monitoring of the Bluesky Firehose
- View and manage interests/keywords
- Analyze and summarize posts matching your interests
- Sentiment analysis of posts
- RAG-based querying over collected posts

## Tech Stack

### Backend

- Rust
- Axum (API server)
- SQLx + SQLite (database)
- Jetstream websocket client

### Frontend

- TypeScript
- Vite.js
- React.js
- Tanstack Query
- Tanstack Router
- shadcn/ui + TailwindCSS

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Node.js (latest LTS version)
- pnpm
- SQLite

### Installation

1. Clone the repository:

```bash
git clone https://github.com/BenJeau/bluflare.git
cd bluflare
```

2. Install backend dependencies:

```bash
cargo build
```

3. Install frontend dependencies:

```bash
cd frontend
pnpm install
```

### Running the Application

1. Start the backend server:

```bash
cargo run
```

2. In a separate terminal, start the frontend development server:

```bash
cd frontend
pnpm dev
```

The application will be available at `http://localhost:5173` by default.

## Project Structure

```
bluflare/
├── backend/           # Rust backend
│   ├── src/          # Source code
│   └── Cargo.toml    # Rust dependencies
├── frontend/         # React frontend
│   ├── src/          # Source code
│   └── package.json  # Node.js dependencies
└── README.md         # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
