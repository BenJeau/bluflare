# General Goal

An application that uses data from the Bluesky Firehose via their Jetstream websocket service.

The goal is to be aware of what Bluesky people are thinking about particular subjects.

# Ways to integrate LLM features

- suggest other potential keywords when the user specify their subject they want to filter on
- summarize all the posts that matches the keywords
- evaluate the sentiment of the posts
- potentially have a RAG over the post's messages to allow to ask any questions over the posts

# Architecture

## Backend

Path: ./backend

SQL migrations are all at the ./backend/migrations folder. Use `cargo sqlx migrate add -r <DESCRIPTION>` to create a new migration and make sure to add the up migrate in the .up.sql file and the teardown migration in the .down.sql

Technologies to use:

- Rust (for programming language)
- Axum (for the API server)
- SQLx and SQLite (for the database)

- Should have the following general models:
  - Interests (which will contain the list of keywords)
  - Posts (the bluesky messages/datetime/user that matched the keywords)
- Have background process that processes the Jetstream websocket server
  - Needs to be able to reconnect to the websocket server if ever the connection goes down
  - It will process the messages by:
    - Collecting all the keywords from the SQLite database
    - Verifying if any keyword is present in the post's message
      - If so, save it to the database
      - Extract all links

## Frontend

Path: ./frontend

PLEASE USE pnpm, not npm!

Technologies to use:

- TypeScript (for programming language)
- Vite.js (for bundler)
- React.js (for UI library)
- Tanstack Query (for async state management + to query the backend)
- Tanstack Router (for routing)
- shadcn/ui + tailwindcss (for React components)

# Detailed features

1. Keep track of list of subjects/keywords to filter on
2. Connect to Bluesky Firehose/Jetstream websocket
3. Filter and save Bluesky posts in the database using the subject/filters
4. Expose APIs to save new and retrieve interests/keywords
5. Expose APIs to retrieve matched posts
6. Create a UI viewing all the interests/keywords
7. Create a UI to create new interests/keywords
8. Create a UI to modify/delete interests/keywords
9. View a specific interest/keywords and its related posts
10. View the general summary of those posts
