<div style="display: flex; align-items: center; gap: 1rem;">
<picture>
  <source media="(prefers-color-scheme: light)" srcset="./frontend/public/logo-light.svg">
  <img height="64" alt="Fallback image description" src="./frontend/public/logo-dark.svg">
</picture>
<h1 style="flex-grow: 1;">Bluflare <a href="https://github.com/BenJeau/bluflare/pkgs/container/bluflare%2Fbackend">
  <img src="https://ghcr-badge.egpl.dev/benjeau/bluflare%2Fbackend/latest_tag?color=%2344cc11&ignore=latest&label=Docker%20Image%20Version&trim=" alt="Docker Image Version (latest semver)">
</a></h1>
</div>

[![GitHub Actions Workflow Status - Rust Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/bluflare/rust_check.yml?logo=github&label=Rust%20Compilation)](https://github.com/BenJeau/bluflare/actions/workflows/rust_check.yml)
[![GitHub Actions Workflow Status - TypeScript Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/bluflare/react_check.yml?logo=github&label=TypeScript%20Compilation)](https://github.com/BenJeau/bluflare/actions/workflows/react_check.yml)
[![GitHub Actions Workflow Status - Rustfmt Check](https://img.shields.io/github/actions/workflow/status/BenJeau/bluflare/rust_fmt.yml?logo=github&label=Rustfmt%20Check)](https://github.com/BenJeau/bluflare/actions/workflows/rust_fmt.yml)
[![GitHub Actions Workflow Status - Prettier Check](https://img.shields.io/github/actions/workflow/status/BenJeau/bluflare/react_fmt.yml?logo=github&label=Prettier%20Check)](https://github.com/BenJeau/bluflare/actions/workflows/react_fmt.yml)

Monitor [Bluesky](https://bsky.app) posts and analyze trends in real-time.

> Powered by the [Bluesky Firehose](https://docs.bsky.app/docs/advanced-guides/firehose) via their [Jetstream](https://github.com/bluesky-social/jetstream) websocket service using [Rust](https://www.rust-lang.org/) with a [React](https://react.dev/) frontend.

![Bluflare Homepage Screenshot](./frontend/screenshot.png)

## Features

- Track and filter Bluesky posts based on custom keywords
- Real-time monitoring of the Bluesky Firehose
- View and manage interests/keywords
- Analyze and summarize posts matching your interests
- Sentiment analysis of posts

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Node.js (latest LTS version)
- pnpm
- SQLite

### Running the Application

1. Clone the repository:

```bash
git clone https://github.com/BenJeau/bluflare.git
cd bluflare
```

2. Install backend dependencies:

```bash
cd backend
cargo run --bin backend
```

3. Install frontend dependencies:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:5173` by default and the backend at `http://localhost:3000`.

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
