# 🍞 نظام إدارة المخابز - Bakery Management System

نظام ويب شامل لإدارة المخابز يربط بين المخبز الرئيسي وعدد من الفروع، مع إدارة الطلبات اليومية، حساب العجائن المطلوبة، المخزون، والتحويلات بين الفروع.

## 📋 المحتويات

- [نظرة عامة](#نظرة-عامة)
- [الميزات الرئيسية](#الميزات-الرئيسية)
- [البنية التقنية](#البنية-التقنية)
- [المتطلبات](#المتطلبات)
- [التثبيت والإعداد](#التثبيت-والإعداد)
- [استخدام النظام](#استخدام-النظام)
- [هيكل المشروع](#هيكل-المشروع)
- [API Documentation](#api-documentation)
- [قاعدة البيانات](#قاعدة-البيانات)

---

## 🎯 نظرة عامة

نظام إدارة المخابز هو تطبيق ويب متكامل يهدف إلى:

- **ربط المخبز الرئيسي بالفروع**: نظام مركزي يجمع طلبات جميع الفروع
- **حساب العجائن تلقائياً**: يحسب عدد العجائن المطلوبة بناءً على الطلبات وسعة كل عجنة
- **إدارة المخزون اليومي**: تتبع المخزون الافتتاحي والختامي لكل فرع
- **تحويلات بين الفروع**: نظام موافقات للتحويلات بين الفروع
- **صلاحيات متعددة**: مدير (كامل الصلاحيات) ومستخدم فرع (صلاحيات محدودة)

## ✨ الميزات الرئيسية

### 1. إدارة الطلبات اليومية
- إدخال طلبات يومية من كل فرع
- جمع الطلبات من جميع الفروع
- حساب عدد العجائن المطلوبة لكل صنف تلقائياً
- معادلة الحساب: `عدد العجائن = ceil(إجمالي الطلب / حبات في العجنة)`
- حساب الفائض والنقص

### 2. إدارة العجائن (Meal Types)
- تعريف أنواع العجائن المختلفة
- تحديد عدد التروليات في العجنة
- تحديد عدد الحبات في الترولي
- حساب تلقائي: `حبات في العجنة = تروليات × حبات في الترولي`
- مثال: عجنة الدونات → 9 ترولي × 50 حبة = 450 حبة/عجنة

### 3. الجرد اليومي
- تسجيل المخزون الافتتاحي والختامي
- تتبع المبيعات، التالف، والتحويلات
- سياسة مرنة لخصم المتبقي من الطلب التالي
- تنبيهات للمخزون المنخفض أو العالي

### 4. التحويلات بين الفروع
- طلب تحويل من فرع لآخر
- نظام موافقات من المدير
- تتبع حالة التحويل (معلق، موافق عليه، مرفوض، مكتمل)
- تحديث المخزون تلقائياً

### 5. لوحة التحكم والتقارير
- ملخص يومي للطلبات والإنتاج
- تقارير الفروع (مبيعات، مخزون، تحويلات)
- تقارير الإنتاج والكفاءة
- تصدير إلى CSV/PDF

### 6. نظام الصلاحيات
- **مدير (Manager)**:
  - كامل الصلاحيات
  - إدارة الفروع والمنتجات والعجائن
  - الموافقة على التحويلات
  - مشاهدة جميع التقارير
  - إعدادات النظام

- **مستخدم فرع (User)**:
  - إدخال طلب فرعه
  - تسجيل المخزون
  - طلب تحويلات
  - مشاهدة تقارير فرعه فقط

## 🏗️ البنية التقنية

### Backend
- **Node.js** + **Express.js**: خادم RESTful API
- **PostgreSQL**: قاعدة بيانات علاقاتية
- **JWT**: نظام المصادقة والتوكنات
- **bcryptjs**: تشفير كلمات المرور
- **express-validator**: التحقق من البيانات

### Frontend
- **React 18**: واجهة مستخدم تفاعلية
- **Material-UI (MUI)**: مكتبة مكونات UI
- **React Router**: التنقل بين الصفحات
- **Zustand**: إدارة الحالة
- **Axios**: طلبات HTTP
- **Vite**: أداة البناء
- **دعم RTL كامل**: واجهة عربية بالكامل

### قاعدة البيانات
- PostgreSQL 14+
- 10 جداول رئيسية
- Indexes للأداء
- Views للاستعلامات المعقدة
- Triggers للتحديث التلقائي
- Foreign keys للنزاهة

## 📦 المتطلبات

- **Node.js**: 18.x أو أحدث
- **PostgreSQL**: 14.x أو أحدث
- **npm** أو **yarn**: لإدارة الحزم
- **Git**: للنسخ والتحكم بالإصدارات

## 🚀 التثبيت والإعداد

### 1. نسخ المشروع

```bash
git clone <repository-url>
cd yahya2
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة بيانات PostgreSQL
createdb bakery_management

# تشغيل schema
psql -d bakery_management -f database/schema.sql

# إدراج بيانات تجريبية (اختياري)
psql -d bakery_management -f database/seed.sql
```

### 3. إعداد Backend

```bash
cd backend

# تثبيت الحزم
npm install

# نسخ ملف البيئة
cp .env.example .env

# تعديل .env بإعداداتك
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=bakery_management
# DB_USER=your_user
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key_min_32_chars

# تشغيل الخادم
npm run dev
```

الخادم سيعمل على: `http://localhost:5000`

### 4. إعداد Frontend

```bash
cd frontend

# تثبيت الحزم
npm install

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: `http://localhost:3000`

## 🔐 حسابات تجريبية

بعد تشغيل `seed.sql`، ستحصل على الحسابات التالية:

| النوع | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|------|-------------------|-------------|-----------|
| مدير | admin@bakery.com | password123 | كاملة |
| فرع النرجس | narjis@bakery.com | password123 | محدودة |
| فرع العليا | olaya@bakery.com | password123 | محدودة |
| فرع الملقا | malqa@bakery.com | password123 | محدودة |
| فرع الياسمين | yasmin@bakery.com | password123 | محدودة |

## 📖 استخدام النظام

### سيناريو كامل للاستخدام اليومي:

#### 1. إنشاء طلب يومي (صباحاً)
- كل فرع يسجل دخوله
- يذهب إلى "الطلبات" → "طلب جديد"
- يختار التاريخ والمنتجات المطلوبة
- يدخل الكمية بالحبات
- يرسل الطلب

#### 2. حساب الإنتاج (المدير)
- المدير يسجل دخوله
- يذهب إلى "لوحة التحكم" أو "ملخص الإنتاج"
- يرى جدول يوضح:
  - إجمالي الطلب لكل صنف
  - عدد العجائن المطلوبة
  - الإنتاج الفعلي
  - الفائض/النقص
- يوافق على الإنتاج

#### 3. تسجيل المخزون (مساءً)
- كل فرع يسجل:
  - المخزون الافتتاحي
  - الوارد من المخبز
  - المبيعات
  - التالف
  - المخزون الختامي

#### 4. التحويلات (عند الحاجة)
- فرع لديه فائض يطلب تحويل لفرع آخر
- المدير يوافق/يرفض
- المخزون يتحدث تلقائياً

## 📁 هيكل المشروع

```
yahya2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # إعدادات PostgreSQL
│   │   ├── models/
│   │   │   ├── Branch.js           # نموذج الفروع
│   │   │   ├── User.js             # نموذج المستخدمين
│   │   │   ├── Meal.js             # نموذج العجائن
│   │   │   ├── Product.js          # نموذج المنتجات
│   │   │   ├── Order.js            # نموذج الطلبات
│   │   │   ├── Inventory.js        # نموذج المخزون
│   │   │   ├── Transfer.js         # نموذج التحويلات
│   │   │   └── Production.js       # نموذج الإنتاج
│   │   ├── controllers/
│   │   │   ├── authController.js   # المصادقة
│   │   │   ├── orderController.js  # الطلبات وحساب العجائن
│   │   │   └── dashboardController.js  # لوحة التحكم
│   │   ├── routes/
│   │   │   ├── index.js            # تجميع المسارات
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── utils/
│   │   │   └── helpers.js          # دوال حساب العجائن
│   │   └── server.js               # نقطة البداية
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx      # التخطيط الرئيسي
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # لوحة التحكم
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   ├── transfers/
│   │   │   └── admin/
│   │   ├── services/
│   │   │   └── api.js              # Axios config
│   │   ├── stores/
│   │   │   └── authStore.js        # Zustand store
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql                  # هيكل قاعدة البيانات
│   └── seed.sql                    # بيانات تجريبية
└── README.md
```

## 🔌 API Documentation

### Authentication

```http
POST /api/v1/auth/login
POST /api/v1/auth/register (Manager only)
GET  /api/v1/auth/profile
POST /api/v1/auth/logout
```

### Orders

```http
GET  /api/v1/orders
POST /api/v1/orders
GET  /api/v1/orders/:id
PUT  /api/v1/orders/:id/status
GET  /api/v1/orders/production-summary/:date
POST /api/v1/orders/production-plan
```

### Inventory

```http
GET  /api/v1/inventory
POST /api/v1/inventory
GET  /api/v1/inventory/current/:branchId
PUT  /api/v1/inventory/:id
```

### Transfers

```http
GET  /api/v1/transfers
POST /api/v1/transfers
GET  /api/v1/transfers/pending
PUT  /api/v1/transfers/:id/approve
PUT  /api/v1/transfers/:id/reject
```

### Dashboard

```http
GET  /api/v1/dashboard/stats
GET  /api/v1/dashboard/branch-report/:branchId
GET  /api/v1/dashboard/production-report
GET  /api/v1/dashboard/inventory-alerts
```

### Admin Routes (Manager only)

```http
# Branches
GET    /api/v1/branches
POST   /api/v1/branches
PUT    /api/v1/branches/:id
DELETE /api/v1/branches/:id

# Products
GET    /api/v1/products
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

# Meals
GET    /api/v1/meals
POST   /api/v1/meals
PUT    /api/v1/meals/:id
DELETE /api/v1/meals/:id
```

## 🗄️ قاعدة البيانات

### الجداول الرئيسية

1. **branches** - الفروع
2. **users** - المستخدمون
3. **meals** - أنواع العجائن
4. **products** - المنتجات/الأصناف
5. **branch_orders** - طلبات الفروع
6. **branch_order_items** - بنود الطلبات
7. **daily_inventory** - الجرد اليومي
8. **transfers** - التحويلات بين الفروع
9. **production_batches** - دفعات الإنتاج
10. **audit_logs** - سجل التدقيق

### Views (طرق عرض محسوبة)

1. **v_daily_orders_summary** - ملخص الطلبات مع حساب العجائن
2. **v_branch_inventory_current** - أحدث حالة للمخزون
3. **v_pending_transfers** - التحويلات المعلقة

### معادلات الحساب الرئيسية

```sql
-- حساب حبات العجنة
pieces_per_batch = trolleys_per_batch * pieces_per_trolley

-- حساب عدد العجائن المطلوبة
batches_needed = CEIL(total_pieces_requested / pieces_per_batch)

-- حساب الإنتاج الفعلي
pieces_to_produce = batches_needed * pieces_per_batch

-- حساب الفائض
surplus = pieces_to_produce - total_pieces_requested
```

## 🧪 الاختبار

```bash
# Backend tests
cd backend
npm test

# Frontend (to be implemented)
cd frontend
npm test
```

## 📝 مثال عملي

### سيناريو: عجنة الدونات

**تعريف العجنة:**
- النوع: عجنة الدونات
- عدد التروليات: 9
- حبات في الترولي: 50
- **إجمالي حبات العجنة**: 9 × 50 = 450 حبة

**الطلبات:**
- فرع النرجس: 120 حبة
- فرع العليا: 150 حبة
- فرع الملقا: 100 حبة
- **إجمالي الطلب**: 370 حبة

**الحساب:**
- عدد العجائن = ceil(370 / 450) = **1 عجنة**
- الإنتاج الفعلي = 1 × 450 = **450 حبة**
- الفائض = 450 - 370 = **80 حبة**

**النتيجة:**
```
المنتج: دونات شوكولاتة
الطلب الكلي: 370 حبة
العجائن المطلوبة: 1 عجنة
الإنتاج الفعلي: 450 حبة
الفائض: 80 حبة
```

## 🔜 ميزات مستقبلية

- [ ] واجهة موبايل (PWA)
- [ ] تحكم في سير العمل (تحضير → خبز → تغليف)
- [ ] طلبات خاصة/مناسبات
- [ ] تكامل مع نقاط البيع POS
- [ ] طباعة ملصقات الترولي
- [ ] تقارير تنبؤية باستخدام AI
- [ ] إشعارات فورية (Push Notifications)
- [ ] تصدير التقارير لـ Excel
- [ ] دعم عدة لغات

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License.

## 👨‍💻 المطور

تم تطويره بواسطة Claude AI

## 📞 الدعم

للدعم والاستفسارات:
- فتح Issue على GitHub
- البريد الإلكتروني: support@bakerymanagement.com

---

**ملاحظة**: هذا المشروع في مرحلة التطوير النشط. بعض الميزات قد تكون قيد الإنشاء.

**صُنع بـ ❤️ للمخابز العربية**
