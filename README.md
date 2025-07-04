# ![Bluflare Logo](./frontend/public/logo-dark-small.png) Bluflare

[![Docker Image Version (latest semver)](https://ghcr-badge.egpl.dev/benjeau/bluflare%2Fbackend/latest_tag?color=%2344cc11&ignore=latest&label=Docker%20Image%20Version&trim=)](https://github.com/BenJeau/bluflare/pkgs/container/bluflare%2Fbackend) [![GitHub Actions Workflow Status - Rust Compilation](https://img.shields.io/github/actions/workflow/status/BenJeau/bluflare/rust_check.yml?logo=github&label=Rust%20Compilation)](https://github.com/BenJeau/bluflare/actions/workflows/rust_check.yml)
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
- Analyze and summarize posts matching your interests with Gemini
- Sentiment analysis of posts
- French and English user interface
- Light and dark mode
- Simple authentication and authorization

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

2. Start the backend:

```bash
cd backend
cargo run --bin backend
```

3. Start the frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:5173` by default and the backend at `http://localhost:3000`.

### Backend configuration

[Figment](https://docs.rs/figment/latest/figment/) is used to define the configuration of the service. Default values are set within the [config.toml](./backend/config.toml) file and all fields can be overwritten using environment variables starting with `BLUFLARE__` and have sections in uppercase and separated with double underscores `__`. For example, to disable the Jetstream websocket client via an environment variable, you would use `BLUFLARE__JETSTREAM__ENABLED=false` as variable.

### Authentication

By default, authentication is disabled and anyone can hit all endpoints (create/delete/update). To enabled authentication, you need to set the `BLUFLARE__SERVER__AUTH__ENABLED` environment variable to `true` and set the `BLUFLARE__SERVER__AUTH__PASSWORD_HASH` and `BLUFLARE__SERVER__AUTH__USERNAME` environment variables to the password hash and username of the admin user.

The password hash can be generated using the following command:

```bash
cd backend && cargo run --bin gen-auth 'PASSWORD'
```

Authentication is done via a cookie and only a single session is allowed at a time. If you log in multiple times, only the last session will be valid.

### Development

The backend is built with:

- API Framework: [Axum](https://github.com/tokio-rs/axum)
- Database: [SQLx](https://github.com/launchbadge/sqlx) + [SQLite](https://www.sqlite.org/index.html)
- Websocket client: [Jetstream](https://github.com/bluesky-social/jetstream)
- Logging: [tracing](https://github.com/tokio-rs/tracing)

The frontend is built with:

- Illustrations: [Manypixels](https://www.manypixels.co/gallery)
- Icons: [Lucide](https://lucide.dev/)
- Styling: [TailwindCSS](https://tailwindcss.com/)
- UI Framework: [shadcn/ui](https://ui.shadcn.com/)
- API Framework: [Tanstack Query](https://tanstack.com/query/latest)
- Routing: [Tanstack Router](https://tanstack.com/router/latest)
- State Management: [Jotai](https://jotai.org/)

## Deployment

Please refer to the [deployment documentation](./deploy/README.md) for more information to deploy to DigitalOcean.

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
