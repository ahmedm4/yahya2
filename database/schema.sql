-- Bakery Management System Database Schema
-- PostgreSQL 14+

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS daily_inventory CASCADE;
DROP TABLE IF EXISTS branch_order_items CASCADE;
DROP TABLE IF EXISTS branch_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('manager', 'user');
CREATE TYPE order_status AS ENUM ('draft', 'submitted', 'confirmed', 'completed', 'cancelled');
CREATE TYPE transfer_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout');

-- ============================================
-- Table: branches (الفروع)
-- ============================================
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    location TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE branches IS 'فروع المخبز';
COMMENT ON COLUMN branches.name IS 'اسم الفرع';
COMMENT ON COLUMN branches.code IS 'كود الفرع (مثل: BR001)';

-- ============================================
-- Table: users (المستخدمين)
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'مستخدمي النظام';
COMMENT ON COLUMN users.role IS 'دور المستخدم: manager (مدير) أو user (مستخدم فرع)';

-- Index for faster authentication queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch ON users(branch_id);

-- ============================================
-- Table: meals (أنواع العجائن)
-- ============================================
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    trolleys_per_batch INTEGER NOT NULL CHECK (trolleys_per_batch > 0),
    pieces_per_trolley INTEGER NOT NULL CHECK (pieces_per_trolley > 0),
    pieces_per_batch INTEGER GENERATED ALWAYS AS (trolleys_per_batch * pieces_per_trolley) STORED,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE meals IS 'أنواع العجائن وخصائصها';
COMMENT ON COLUMN meals.trolleys_per_batch IS 'عدد التروليات في العجنة الواحدة';
COMMENT ON COLUMN meals.pieces_per_trolley IS 'عدد الحبات في الترولي الواحد';
COMMENT ON COLUMN meals.pieces_per_batch IS 'إجمالي الحبات في العجنة (محسوب تلقائياً)';

-- ============================================
-- Table: products (المنتجات/الأصناف)
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE RESTRICT,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE products IS 'المنتجات والأصناف';
COMMENT ON COLUMN products.sku IS 'رمز المنتج (Stock Keeping Unit)';
COMMENT ON COLUMN products.meal_id IS 'نوع العجنة المستخدمة لهذا المنتج';

CREATE INDEX idx_products_meal ON products(meal_id);

-- ============================================
-- Table: branch_orders (طلبات الفروع)
-- ============================================
CREATE TABLE branch_orders (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    order_date DATE NOT NULL,
    status order_status DEFAULT 'draft',
    notes TEXT,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    confirmed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, order_date)
);

COMMENT ON TABLE branch_orders IS 'طلبات الفروع اليومية';
COMMENT ON COLUMN branch_orders.order_date IS 'تاريخ الطلب';
COMMENT ON COLUMN branch_orders.status IS 'حالة الطلب';

CREATE INDEX idx_branch_orders_date ON branch_orders(order_date);
CREATE INDEX idx_branch_orders_branch ON branch_orders(branch_id);
CREATE INDEX idx_branch_orders_status ON branch_orders(status);

-- ============================================
-- Table: branch_order_items (بنود طلبات الفروع)
-- ============================================
CREATE TABLE branch_order_items (
    id SERIAL PRIMARY KEY,
    branch_order_id INTEGER NOT NULL REFERENCES branch_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    pieces_requested INTEGER NOT NULL CHECK (pieces_requested >= 0),
    pieces_delivered INTEGER DEFAULT 0 CHECK (pieces_delivered >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_order_id, product_id)
);

COMMENT ON TABLE branch_order_items IS 'بنود الطلبات (كل صنف في كل طلب)';
COMMENT ON COLUMN branch_order_items.pieces_requested IS 'عدد الحبات المطلوبة';
COMMENT ON COLUMN branch_order_items.pieces_delivered IS 'عدد الحبات المسلمة فعلياً';

CREATE INDEX idx_order_items_order ON branch_order_items(branch_order_id);
CREATE INDEX idx_order_items_product ON branch_order_items(product_id);

-- ============================================
-- Table: daily_inventory (الجرد اليومي)
-- ============================================
CREATE TABLE daily_inventory (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    inventory_date DATE NOT NULL,
    opening_stock INTEGER DEFAULT 0 CHECK (opening_stock >= 0),
    received INTEGER DEFAULT 0 CHECK (received >= 0),
    sold INTEGER DEFAULT 0 CHECK (sold >= 0),
    transferred_out INTEGER DEFAULT 0 CHECK (transferred_out >= 0),
    transferred_in INTEGER DEFAULT 0 CHECK (transferred_in >= 0),
    damaged INTEGER DEFAULT 0 CHECK (damaged >= 0),
    closing_stock INTEGER DEFAULT 0 CHECK (closing_stock >= 0),
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, product_id, inventory_date)
);

COMMENT ON TABLE daily_inventory IS 'الجرد اليومي للمخزون';
COMMENT ON COLUMN daily_inventory.opening_stock IS 'المخزون الافتتاحي';
COMMENT ON COLUMN daily_inventory.received IS 'الوارد من المخبز الرئيسي';
COMMENT ON COLUMN daily_inventory.sold IS 'المباع';
COMMENT ON COLUMN daily_inventory.transferred_out IS 'المحول لفروع أخرى';
COMMENT ON COLUMN daily_inventory.transferred_in IS 'الوارد من فروع أخرى';
COMMENT ON COLUMN daily_inventory.damaged IS 'التالف';
COMMENT ON COLUMN daily_inventory.closing_stock IS 'المخزون الختامي';

CREATE INDEX idx_inventory_branch ON daily_inventory(branch_id);
CREATE INDEX idx_inventory_product ON daily_inventory(product_id);
CREATE INDEX idx_inventory_date ON daily_inventory(inventory_date);

-- ============================================
-- Table: transfers (التحويلات بين الفروع)
-- ============================================
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    to_branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    pieces INTEGER NOT NULL CHECK (pieces > 0),
    transfer_date DATE NOT NULL,
    status transfer_status DEFAULT 'pending',
    requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_branch_id != to_branch_id)
);

COMMENT ON TABLE transfers IS 'التحويلات بين الفروع';
COMMENT ON COLUMN transfers.transfer_number IS 'رقم التحويل (مثل: TR-20241118-001)';
COMMENT ON COLUMN transfers.pieces IS 'عدد الحبات المحولة';
COMMENT ON COLUMN transfers.status IS 'حالة التحويل';

CREATE INDEX idx_transfers_from ON transfers(from_branch_id);
CREATE INDEX idx_transfers_to ON transfers(to_branch_id);
CREATE INDEX idx_transfers_date ON transfers(transfer_date);
CREATE INDEX idx_transfers_status ON transfers(status);

-- ============================================
-- Table: production_batches (دفعات الإنتاج)
-- ============================================
CREATE TABLE production_batches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE RESTRICT,
    production_date DATE NOT NULL,
    batches_planned INTEGER NOT NULL CHECK (batches_planned > 0),
    batches_produced INTEGER DEFAULT 0 CHECK (batches_produced >= 0),
    pieces_planned INTEGER NOT NULL CHECK (pieces_planned > 0),
    pieces_produced INTEGER DEFAULT 0 CHECK (pieces_produced >= 0),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE production_batches IS 'دفعات الإنتاج المخططة والفعلية';
COMMENT ON COLUMN production_batches.batches_planned IS 'عدد العجائن المخططة';
COMMENT ON COLUMN production_batches.batches_produced IS 'عدد العجائن المنتجة فعلياً';
COMMENT ON COLUMN production_batches.pieces_planned IS 'عدد الحبات المخططة';
COMMENT ON COLUMN production_batches.pieces_produced IS 'عدد الحبات المنتجة فعلياً';

CREATE INDEX idx_production_product ON production_batches(product_id);
CREATE INDEX idx_production_date ON production_batches(production_date);

-- ============================================
-- Table: audit_logs (سجل التدقيق)
-- ============================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'سجل التدقيق لجميع العمليات';

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branch_orders_updated_at BEFORE UPDATE ON branch_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branch_order_items_updated_at BEFORE UPDATE ON branch_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_inventory_updated_at BEFORE UPDATE ON daily_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views for common queries
-- ============================================

-- View: Daily orders summary (ملخص الطلبات اليومية)
CREATE OR REPLACE VIEW v_daily_orders_summary AS
SELECT
    bo.order_date,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    m.id AS meal_id,
    m.name AS meal_name,
    m.pieces_per_batch,
    SUM(boi.pieces_requested) AS total_pieces_requested,
    CEIL(SUM(boi.pieces_requested)::DECIMAL / m.pieces_per_batch) AS batches_needed,
    CEIL(SUM(boi.pieces_requested)::DECIMAL / m.pieces_per_batch) * m.pieces_per_batch AS pieces_to_produce,
    (CEIL(SUM(boi.pieces_requested)::DECIMAL / m.pieces_per_batch) * m.pieces_per_batch) - SUM(boi.pieces_requested) AS surplus
FROM branch_orders bo
JOIN branch_order_items boi ON bo.id = boi.branch_order_id
JOIN products p ON boi.product_id = p.id
JOIN meals m ON p.meal_id = m.id
WHERE bo.status IN ('submitted', 'confirmed')
GROUP BY bo.order_date, p.id, p.name, p.sku, m.id, m.name, m.pieces_per_batch
ORDER BY bo.order_date DESC, p.name;

COMMENT ON VIEW v_daily_orders_summary IS 'ملخص الطلبات اليومية مع حساب العجائن المطلوبة';

-- View: Branch inventory status (حالة مخزون الفروع)
CREATE OR REPLACE VIEW v_branch_inventory_current AS
SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    p.id AS product_id,
    p.name AS product_name,
    di.inventory_date,
    di.closing_stock,
    di.updated_at
FROM daily_inventory di
JOIN branches b ON di.branch_id = b.id
JOIN products p ON di.product_id = p.id
WHERE (di.branch_id, di.product_id, di.inventory_date) IN (
    SELECT branch_id, product_id, MAX(inventory_date)
    FROM daily_inventory
    GROUP BY branch_id, product_id
)
ORDER BY b.name, p.name;

COMMENT ON VIEW v_branch_inventory_current IS 'أحدث حالة للمخزون لكل فرع ومنتج';

-- View: Pending transfers (التحويلات المعلقة)
CREATE OR REPLACE VIEW v_pending_transfers AS
SELECT
    t.id,
    t.transfer_number,
    t.transfer_date,
    bf.name AS from_branch,
    bt.name AS to_branch,
    p.name AS product_name,
    t.pieces,
    t.status,
    u.name AS requested_by_name,
    t.created_at
FROM transfers t
JOIN branches bf ON t.from_branch_id = bf.id
JOIN branches bt ON t.to_branch_id = bt.id
JOIN products p ON t.product_id = p.id
LEFT JOIN users u ON t.requested_by = u.id
WHERE t.status = 'pending'
ORDER BY t.created_at;

COMMENT ON VIEW v_pending_transfers IS 'التحويلات التي تحتاج موافقة';
