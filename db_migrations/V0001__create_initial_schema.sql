-- Create tables for Phone Search Bot

-- Table for storing phone database records
CREATE TABLE IF NOT EXISTS phone_records (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255),
    info TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for bot users
CREATE TABLE IF NOT EXISTS bot_users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    search_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for search history
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES bot_users(id),
    phone VARCHAR(20),
    found BOOLEAN DEFAULT FALSE,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_records_phone ON phone_records(phone);
CREATE INDEX IF NOT EXISTS idx_phone_records_status ON phone_records(status);
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram_id ON bot_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_status ON bot_users(status);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at);

-- Insert sample data
INSERT INTO phone_records (phone, name, info, status) VALUES
    ('+79991234567', 'Иван Петров', 'Москва, ул. Ленина 1', 'active'),
    ('+79992345678', 'Мария Сидорова', 'СПб, Невский пр. 10', 'active'),
    ('+79993456789', 'Алексей Смирнов', 'Казань, пр. Победы 5', 'inactive'),
    ('+79994567890', 'Елена Волкова', 'Н.Новгород, ул. Горького 3', 'active'),
    ('+79995678901', 'Дмитрий Козлов', 'Екатеринбург, ул. Мира 7', 'active')
ON CONFLICT (phone) DO NOTHING;