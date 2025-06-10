CREATE TABLE IF NOT EXISTS "topics" (
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

CREATE TABLE IF NOT EXISTS "post_topics" (
    "post_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    PRIMARY KEY ("post_id", "topic_id"),
    FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("topic_id") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "post_mentions" (
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    PRIMARY KEY ("post_id", "user_id"),
    FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO
    "topics" (
        "subject",
        "slug",
        "description",
        "keywords"
    )
VALUES (
        'AI',
        'ai',
        'Artificial Intelligence - AI is the future of the world and the future of the world is AI 🤯',
        json_array(
            'AI',
            'Artificial Intelligence',
            'Machine Learning',
            'Deep Learning',
            'Neural Network',
            'Chatbot',
            'ChatGPT',
            'GPT',
            'LLM',
            'Gemini',
            'Claude',
            'OpenAI'
        )
    ),
    (
        'Cybersecurity',
        'cybersecurity',
        'Security vulnerabilities and threats',
        json_array(
            'Cybersecurity',
            'Security',
            'Vulnerabilities',
            'Threats',
            'Defense',
            'Protection',
            'Attack',
            'Hacking',
            'CVE',
            'Ransomware',
            'Malware',
            'Phishing',
            'DDoS',
            'Botnet',
            'Zero-day',
            'Exploit'
        )
    );

CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics (created_at);

CREATE INDEX IF NOT EXISTS idx_post_topics_topic_id ON post_topics (topic_id);

CREATE INDEX IF NOT EXISTS idx_post_topics_post_id ON post_topics (post_id);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);