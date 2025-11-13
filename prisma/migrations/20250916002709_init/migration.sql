-- ============================================
-- TABLAS BASE
-- ============================================

CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    first_name    varchar(100) NOT NULL,
    last_name     varchar(100) NOT NULL,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at    timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(100) NOT NULL UNIQUE,
    description text,
    created_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(255) NOT NULL,
    description text,
    start_date  timestamp WITHOUT TIME ZONE NOT NULL,
    end_date    timestamp WITHOUT TIME ZONE,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(255) NOT NULL,
    description text,
    cost        numeric(10, 2) NOT NULL,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- TABLAS INTERMEDIAS / RELACIONALES
-- ============================================

-- Relación muchos a muchos: users ↔ roles
CREATE TABLE user_roles (
    user_id     uuid NOT NULL,
    role_id     uuid NOT NULL,
    assigned_at timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Inventario de productos por evento
CREATE TABLE event_inventories (
    event_id    uuid NOT NULL,
    product_id  uuid NOT NULL,
    initial_qty numeric(10, 2) NOT NULL,
    min_qty     numeric(10, 2) NOT NULL,
    price       numeric(10, 2) NOT NULL,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at  timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (event_id, product_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- ÓRDENES, ITEMS Y VENTAS
-- ============================================

CREATE TABLE orders (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     uuid NOT NULL,
    created_by   uuid NOT NULL, -- FK a users
    order_number integer NOT NULL,
    status       varchar(50) NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    created_at   timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at   timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (event_id)   REFERENCES events(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE order_status (
    id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL UNIQUE
);

CREATE TABLE order_items (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   uuid NOT NULL,
    event_id   uuid NOT NULL,
    product_id uuid NOT NULL,
    qty        numeric(10, 2) NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    status     varchar(50) NOT NULL,
    created_at timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (event_id)   REFERENCES events(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    -- Relación lógica con event_inventories (evento + producto)
    FOREIGN KEY (event_id, product_id)
        REFERENCES event_inventories(event_id, product_id)
);

CREATE TABLE sales (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   uuid NOT NULL,
    method     varchar(50) NOT NULL,
    amount     numeric(10, 2) NOT NULL,
    created_at timestamp WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
