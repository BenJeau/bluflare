CREATE TABLE IF NOT EXISTS interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    keywords BLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    did TEXT NOT NULL,
    cid TEXT NOT NULL,
    rkey TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    text TEXT NOT NULL,
    langs BLOB NOT NULL,
    urls BLOB NOT NULL,
    num_urls INTEGER NOT NULL,
    tags BLOB NOT NULL,
    num_tags INTEGER NOT NULL,
    aka BLOB NOT NULL,
    interest_id INTEGER NOT NULL,
    FOREIGN KEY (interest_id) REFERENCES interests (id)
);

INSERT INTO interests (subject, description, keywords) VALUES ('AI', 'Artificial Intelligence - AI is the future of the world and the future of the world is AI 🤯', json_array('AI', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Network', 'Chatbot', 'ChatGPT', 'GPT', 'LLM', 'Gemini', 'Claude', 'OpenAI'));