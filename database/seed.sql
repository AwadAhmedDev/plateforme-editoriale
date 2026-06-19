USE app_db;

INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    role
)
VALUES (
    'Admin',
    'System',
    'admin@example.com',
    '$2b$10$replace_with_real_hash',
    'ADMIN'
);