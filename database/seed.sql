-- Seed Data for Bakery Management System
-- هذا الملف يحتوي على بيانات تجريبية أولية

-- ============================================
-- Insert Branches (الفروع)
-- ============================================
INSERT INTO branches (name, code, location, contact_phone, contact_email, active) VALUES
('المخبز الرئيسي', 'BR001', 'الرياض - حي الملز', '0501234567', 'main@bakery.com', true),
('فرع النرجس', 'BR002', 'الرياض - حي النرجس', '0501234568', 'narjis@bakery.com', true),
('فرع العليا', 'BR003', 'الرياض - حي العليا', '0501234569', 'olaya@bakery.com', true),
('فرع الملقا', 'BR004', 'الرياض - حي الملقا', '0501234570', 'malqa@bakery.com', true),
('فرع الياسمين', 'BR005', 'الرياض - حي الياسمين', '0501234571', 'yasmin@bakery.com', true);

-- ============================================
-- Insert Users (المستخدمين)
-- Password for all users: "password123" (hashed with bcrypt)
-- ============================================
INSERT INTO users (name, email, password_hash, role, branch_id, active) VALUES
('أحمد المدير', 'admin@bakery.com', '$2a$10$hKL6TR6cW2AEnOCRVsp1G.OwF3Z4Aqqlsbr.PbFvX8Ci1hWfIeIky', 'manager', 1, true),
('محمد مدير فرع النرجس', 'narjis@bakery.com', '$2a$10$hKL6TR6cW2AEnOCRVsp1G.OwF3Z4Aqqlsbr.PbFvX8Ci1hWfIeIky', 'user', 2, true),
('فاطمة مديرة فرع العليا', 'olaya@bakery.com', '$2a$10$hKL6TR6cW2AEnOCRVsp1G.OwF3Z4Aqqlsbr.PbFvX8Ci1hWfIeIky', 'user', 3, true),
('خالد مدير فرع الملقا', 'malqa@bakery.com', '$2a$10$hKL6TR6cW2AEnOCRVsp1G.OwF3Z4Aqqlsbr.PbFvX8Ci1hWfIeIky', 'user', 4, true),
('نورة مديرة فرع الياسمين', 'yasmin@bakery.com', '$2a$10$hKL6TR6cW2AEnOCRVsp1G.OwF3Z4Aqqlsbr.PbFvX8Ci1hWfIeIky', 'user', 5, true);

-- ============================================
-- Insert Meals (أنواع العجائن)
-- ============================================
INSERT INTO meals (name, code, trolleys_per_batch, pieces_per_trolley, active) VALUES
('عجنة الدونات', 'MEAL001', 9, 50, true),
('عجنة الكرواسون', 'MEAL002', 8, 40, true),
('عجنة الخبز الفرنسي', 'MEAL003', 10, 30, true),
('عجنة البيتزا', 'MEAL004', 6, 45, true),
('عجنة الكيك', 'MEAL005', 5, 24, true),
('عجنة المعمول', 'MEAL006', 12, 60, true);

-- ============================================
-- Insert Products (المنتجات)
-- ============================================
INSERT INTO products (name, sku, description, meal_id, unit_price, active) VALUES
('دونات شوكولاتة', 'PRD001', 'دونات محشوة بالشوكولاتة', 1, 3.50, true),
('دونات فانيليا', 'PRD002', 'دونات محشوة بالفانيليا', 1, 3.50, true),
('كرواسون سادة', 'PRD003', 'كرواسون فرنسي أصلي', 2, 5.00, true),
('كرواسون جبن', 'PRD004', 'كرواسون محشو بالجبن', 2, 6.00, true),
('خبز فرنسي', 'PRD005', 'باغيت فرنسي طازج', 3, 4.00, true),
('بيتزا مارجريتا', 'PRD006', 'بيتزا بالجبن والطماطم', 4, 15.00, true),
('بيتزا بيبروني', 'PRD007', 'بيتزا باللحم المقدد', 4, 18.00, true),
('كيك شوكولاتة', 'PRD008', 'كيك شوكولاتة غني', 5, 25.00, true),
('كيك فانيليا', 'PRD009', 'كيك فانيليا كلاسيكي', 5, 22.00, true),
('معمول تمر', 'PRD010', 'معمول محشو بالتمر', 6, 2.50, true),
('معمول جوز', 'PRD011', 'معمول محشو بالجوز', 6, 3.00, true);

-- ============================================
-- Insert Sample Orders (طلبات تجريبية)
-- ============================================
-- Orders for today
INSERT INTO branch_orders (branch_id, order_date, status, submitted_by, submitted_at) VALUES
(2, CURRENT_DATE, 'submitted', 2, CURRENT_TIMESTAMP),
(3, CURRENT_DATE, 'submitted', 3, CURRENT_TIMESTAMP),
(4, CURRENT_DATE, 'submitted', 4, CURRENT_TIMESTAMP),
(5, CURRENT_DATE, 'draft', 5, NULL);

-- Order items for branch 2 (النرجس)
INSERT INTO branch_order_items (branch_order_id, product_id, pieces_requested, pieces_delivered) VALUES
(1, 1, 120, 0),  -- دونات شوكولاتة
(1, 2, 80, 0),   -- دونات فانيليا
(1, 3, 100, 0),  -- كرواسون سادة
(1, 5, 50, 0);   -- خبز فرنسي

-- Order items for branch 3 (العليا)
INSERT INTO branch_order_items (branch_order_id, product_id, pieces_requested, pieces_delivered) VALUES
(2, 1, 150, 0),  -- دونات شوكولاتة
(2, 3, 120, 0),  -- كرواسون سادة
(2, 6, 30, 0),   -- بيتزا مارجريتا
(2, 10, 200, 0); -- معمول تمر

-- Order items for branch 4 (الملقا)
INSERT INTO branch_order_items (branch_order_id, product_id, pieces_requested, pieces_delivered) VALUES
(3, 1, 100, 0),  -- دونات شوكولاتة
(3, 2, 70, 0),   -- دونات فانيليا
(3, 4, 80, 0),   -- كرواسون جبن
(3, 7, 25, 0);   -- بيتزا بيبروني

-- Order items for branch 5 (الياسمين) - Draft
INSERT INTO branch_order_items (branch_order_id, product_id, pieces_requested, pieces_delivered) VALUES
(4, 1, 90, 0),
(4, 5, 60, 0),
(4, 8, 20, 0);

-- ============================================
-- Insert Sample Inventory (مخزون تجريبي)
-- ============================================
-- Yesterday's inventory
INSERT INTO daily_inventory (branch_id, product_id, inventory_date, opening_stock, received, sold, closing_stock, recorded_by)
VALUES
(2, 1, CURRENT_DATE - 1, 50, 150, 180, 20, 2),
(2, 2, CURRENT_DATE - 1, 30, 100, 110, 20, 2),
(3, 1, CURRENT_DATE - 1, 40, 200, 220, 20, 3),
(3, 3, CURRENT_DATE - 1, 60, 150, 190, 20, 3);

-- ============================================
-- Insert Sample Production Batches (إنتاج تجريبي)
-- ============================================
INSERT INTO production_batches (product_id, meal_id, production_date, batches_planned, batches_produced, pieces_planned, pieces_produced, created_by)
VALUES
(1, 1, CURRENT_DATE, 2, 2, 900, 900, 1),  -- دونات شوكولاتة: 2 عجائن = 900 حبة
(2, 1, CURRENT_DATE, 1, 1, 450, 450, 1),  -- دونات فانيليا: 1 عجنة = 450 حبة
(3, 2, CURRENT_DATE, 2, 2, 640, 640, 1);  -- كرواسون سادة: 2 عجائن = 640 حبة

-- ============================================
-- Insert Sample Transfer (تحويل تجريبي)
-- ============================================
INSERT INTO transfers (transfer_number, from_branch_id, to_branch_id, product_id, pieces, transfer_date, status, requested_by, notes)
VALUES
('TR-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001', 2, 3, 1, 50, CURRENT_DATE, 'pending', 3, 'نحتاج دونات إضافية للطلب العاجل');

-- ============================================
-- Sample Audit Logs
-- ============================================
INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
VALUES
(1, 'create', 'branches', 1, '{"name": "المخبز الرئيسي"}'::jsonb),
(2, 'create', 'branch_orders', 1, ('{"branch_id": 2, "order_date": "' || CURRENT_DATE || '"}')::jsonb);

-- ============================================
-- Grant permissions (if needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bakery_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bakery_user;

-- Display summary
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Total branches: %', (SELECT COUNT(*) FROM branches);
    RAISE NOTICE 'Total users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Total meals: %', (SELECT COUNT(*) FROM meals);
    RAISE NOTICE 'Total products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Total orders: %', (SELECT COUNT(*) FROM branch_orders);
    RAISE NOTICE '---';
    RAISE NOTICE 'Default login credentials:';
    RAISE NOTICE 'Manager: admin@bakery.com / password123';
    RAISE NOTICE 'Branch User: narjis@bakery.com / password123';
END $$;
