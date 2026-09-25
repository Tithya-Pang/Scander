-- ==========================================
-- SCANDER DATABASE SCHEMA
-- QR Code Self-Order Restaurant System
-- Version 1.0
-- ==========================================


-- =========================
-- 1. Restaurant
-- =========================

CREATE TABLE restaurant (

    restaurant_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    address TEXT,

    phone VARCHAR(20),

    logo TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- 2. Restaurant Tables
-- =========================

CREATE TABLE restaurant_table (

    table_id SERIAL PRIMARY KEY,

    restaurant_id INT NOT NULL,

    table_number VARCHAR(20) NOT NULL,

    qr_code VARCHAR(255) UNIQUE NOT NULL,

    status VARCHAR(20)
        DEFAULT 'AVAILABLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY (restaurant_id)
        REFERENCES restaurant(restaurant_id)

);



-- =========================
-- 3. Table Session
-- =========================

CREATE TABLE table_session (

    session_id SERIAL PRIMARY KEY,

    table_id INT NOT NULL,

    session_status VARCHAR(20)
        DEFAULT 'ACTIVE',

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ended_at TIMESTAMP,


    FOREIGN KEY(table_id)
        REFERENCES restaurant_table(table_id)

);



-- =========================
-- 4. Users
-- Admin / Kitchen / Cashier
-- =========================

CREATE TABLE users (

    user_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150)
        UNIQUE NOT NULL,

    password VARCHAR(255)
        NOT NULL,

    role VARCHAR(30)
        NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- =========================
-- 5. Category
-- =========================

CREATE TABLE category (

    category_id SERIAL PRIMARY KEY,

    restaurant_id INT NOT NULL,

    name VARCHAR(100)
        NOT NULL,

    description TEXT,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(restaurant_id)
        REFERENCES restaurant(restaurant_id)

);



-- =========================
-- 6. Menu Item
-- =========================

CREATE TABLE menu_item (

    item_id SERIAL PRIMARY KEY,

    category_id INT NOT NULL,


    name VARCHAR(150)
        NOT NULL,


    description TEXT,


    price DECIMAL(10,2)
        NOT NULL,


    unit VARCHAR(30),


    image_url TEXT,


    availability BOOLEAN
        DEFAULT TRUE,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(category_id)
        REFERENCES category(category_id)

);



-- =========================
-- 7. Menu Variant
-- Example:
-- Latte
-- Medium / Large
-- =========================

CREATE TABLE menu_variant (

    variant_id SERIAL PRIMARY KEY,

    item_id INT NOT NULL,


    size VARCHAR(50)
        NOT NULL,


    extra_price DECIMAL(10,2)
        DEFAULT 0,


    FOREIGN KEY(item_id)
        REFERENCES menu_item(item_id)

);



-- =========================
-- 8. Orders
-- =========================

CREATE TABLE orders (

    order_id SERIAL PRIMARY KEY,


    session_id INT NOT NULL,


    status VARCHAR(30)
        DEFAULT 'PENDING',


    total_price DECIMAL(10,2)
        NOT NULL,


    customer_note TEXT,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(session_id)
        REFERENCES table_session(session_id)

);



-- =========================
-- 9. Order Items
-- =========================

CREATE TABLE order_item (

    order_item_id SERIAL PRIMARY KEY,


    order_id INT NOT NULL,


    item_id INT NOT NULL,


    variant_id INT,


    quantity INT
        DEFAULT 1,


    price DECIMAL(10,2)
        NOT NULL,


    notes TEXT,


    FOREIGN KEY(order_id)
        REFERENCES orders(order_id),


    FOREIGN KEY(item_id)
        REFERENCES menu_item(item_id),


    FOREIGN KEY(variant_id)
        REFERENCES menu_variant(variant_id)

);



-- =========================
-- 10. Order Status History
-- =========================

CREATE TABLE order_status_history (

    history_id SERIAL PRIMARY KEY,


    order_id INT NOT NULL,


    user_id INT,


    old_status VARCHAR(30),


    new_status VARCHAR(30)
        NOT NULL,


    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(order_id)
        REFERENCES orders(order_id),


    FOREIGN KEY(user_id)
        REFERENCES users(user_id)

);



-- =========================
-- 11. Payment
-- =========================

CREATE TABLE payment (

    payment_id SERIAL PRIMARY KEY,


    order_id INT UNIQUE NOT NULL,


    payment_method VARCHAR(30),


    payment_status VARCHAR(30)
        DEFAULT 'PENDING',


    amount DECIMAL(10,2)
        NOT NULL,


    transaction_id VARCHAR(255),


    paid_at TIMESTAMP,


    FOREIGN KEY(order_id)
        REFERENCES orders(order_id)

);



-- =========================
-- 12. Receipt
-- =========================

CREATE TABLE receipt (

    receipt_id SERIAL PRIMARY KEY,


    payment_id INT UNIQUE NOT NULL,


    receipt_number VARCHAR(100)
        UNIQUE NOT NULL,


    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    FOREIGN KEY(payment_id)
        REFERENCES payment(payment_id)

);