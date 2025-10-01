
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT,
    credits INT DEFAULT 10
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    descritpion TEXT,
    category VARCHAR(50), 
    user_id INT REFERENCES users(id)
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id), 
    requester_id INT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending'
);
