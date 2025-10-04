

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INT DEFAULT 10
[cite_start]); [cite: 296-302]

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    user_id INT REFERENCES users(id) ON DELETE CASCADE
[cite_start]); [cite: 303-310]

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    requester_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
[cite_start]); [cite: 311-316]