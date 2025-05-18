CREATE TABLE IF NOT EXISTS "interests" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "slug" TEXT NOT NULL UNIQUE,
    "subject" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "keywords" BLOB NOT NULL,
    "last_analysis" TEXT DEFAULT NULL,
    "last_analysis_at" DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "did" TEXT NOT NULL UNIQUE,
    "aka" BLOB NOT NULL,
    "aka_retrieved_at" DATETIME NOT NULL,
    "last_analysis" TEXT DEFAULT NULL,
    "last_analysis_at" DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS "posts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "cid" TEXT NOT NULL,
    "rkey" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "langs" BLOB NOT NULL,
    "urls" BLOB NOT NULL,
    "tags" BLOB NOT NULL,
    "author_id" INTEGER NOT NULL,
    FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "post_interests" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "interest_id" INTEGER NOT NULL,
    FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("interest_id") REFERENCES "interests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("post_id", "interest_id")
);

CREATE TABLE IF NOT EXISTS "post_mentions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("post_id", "user_id")
);

INSERT INTO "interests" ("subject", "slug", "description", "keywords")
VALUES (
    'AI',
    'ai',
    'Artificial Intelligence - AI is the future of the world and the future of the world is AI 🤯',
    json_array('AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Network', 'Chatbot', 'ChatGPT', 'GPT', 'LLM', 'Gemini', 'Claude', 'OpenAI')
);
