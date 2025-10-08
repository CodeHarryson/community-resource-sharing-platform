-- This script will be run automatically when the database container starts.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INT DEFAULT 10
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_filename VARCHAR(255),
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    resource_id INT REFERENCES resources(id) ON DELETE CASCADE,
    requester_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Sample seed data for local development
-- Note: passwords are placeholders; use the registration endpoint to create real users
INSERT INTO users (name, email, password, credits) VALUES
    ('Alice Johnson', 'alice@example.com', '$2b$10$placeholderhash0000000000000000000000', 12),
    ('Bob Martinez', 'bob@example.com', '$2b$10$placeholderhash0000000000000000000000', 8),
    ('Carol Nguyen', 'carol@example.com', '$2b$10$placeholderhash0000000000000000000000', 15);

INSERT INTO resources (title, description, category, image_filename, user_id) VALUES
    ('Gently used sofa', 'Comfortable 3-seater sofa in good condition. Slight wear on one arm. Free to a good home.', 'Furniture', 'sofa.jpg', 1),
    ('Calculus textbook - Stewart', 'Stewart Calculus 8th edition, like new. Prefer local pickup.', 'Textbook', 'textbook.svg', 2),
    ('Board games bundle', 'A set of family board games (Catan, Ticket to Ride, Carcassonne). Great for evenings.', 'Games', 'board games.jpg', 3),
    ('Dining table (round)', 'Wooden round dining table, seats 4. Minor scratches on top.', 'Furniture', 'dining table.jpg', 1),
    ('Kids bicycle (18 inch)', 'Good condition, new tires last month, helmet included.', 'Sporting', 'kids-bicycle.jpg', 2);

    -- Notifications table and sample notifications
    CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO notifications (user_id, message, read) VALUES
        (1, 'Your request for "Gently used sofa" was approved.', FALSE),
        (2, 'New item listed: Dining table (round).', FALSE),
        (1, 'Carol commented on your listing.', FALSE);
