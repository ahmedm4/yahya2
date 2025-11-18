# 🚀 دليل التشغيل السريع

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:
- Node.js (18.x أو أحدث)
- PostgreSQL (14.x أو أحدث)
- Git

## خطوات التشغيل السريع

### 1. إعداد قاعدة البيانات (5 دقائق)

```bash
# إنشاء قاعدة بيانات جديدة
createdb bakery_management

# تشغيل schema
psql -d bakery_management -f database/schema.sql

# إدراج بيانات تجريبية
psql -d bakery_management -f database/seed.sql
```

### 2. تشغيل Backend (دقيقتان)

```bash
# الانتقال لمجلد backend
cd backend

# تثبيت الحزم (مرة واحدة)
npm install

# نسخ وتعديل ملف البيئة
cp .env.example .env

# تعديل .env بمعلومات قاعدة البيانات الخاصة بك
# افتح .env في محرر نصوص وعدل:
# DB_USER=your_postgres_username
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=any_random_string_min_32_characters

# تشغيل الخادم
npm run dev
```

✅ **الخادم يعمل الآن على:** `http://localhost:5000`

### 3. تشغيل Frontend (دقيقتان)

افتح terminal جديد:

```bash
# الانتقال لمجلد frontend
cd frontend

# تثبيت الحزم (مرة واحدة)
npm install

# تشغيل التطبيق
npm run dev
```

✅ **التطبيق يعمل الآن على:** `http://localhost:3000`

## 🎉 جاهز للاستخدام!

افتح المتصفح على `http://localhost:3000` وسجل دخولك بأحد الحسابات التجريبية:

### حساب المدير (كامل الصلاحيات)
```
البريد: admin@bakery.com
كلمة المرور: password123
```

### حساب فرع (صلاحيات محدودة)
```
البريد: narjis@bakery.com
كلمة المرور: password123
```

## 🔍 اختبار سريع

1. سجل دخول كمدير
2. اذهب إلى "لوحة التحكم" لرؤية الإحصائيات
3. اذهب إلى "الطلبات" → "ملخص الإنتاج" لرؤية حسابات العجائن
4. جرب التنقل بين الصفحات المختلفة

## 🛠️ استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات

```bash
# تأكد من تشغيل PostgreSQL
# على macOS:
brew services start postgresql

# على Linux:
sudo systemctl start postgresql

# اختبر الاتصال
psql -d bakery_management -c "SELECT 1;"
```

### المنافذ مستخدمة بالفعل

إذا كان المنفذ 5000 أو 3000 مستخدماً:

```bash
# للـ Backend، عدل في backend/.env:
PORT=5001

# للـ Frontend، عدل في frontend/vite.config.js:
server: { port: 3001 }
```

### مشكلة في تثبيت الحزم

```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install

# أو استخدم yarn
yarn install
```

## 📚 التالي؟

- اقرأ [README.md](README.md) للتفاصيل الكاملة
- استكشف [API Documentation](README.md#api-documentation)
- تعرف على [هيكل المشروع](README.md#هيكل-المشروع)

## 💡 نصائح

- استخدم **Postman** أو **Thunder Client** لاختبار الـ API
- افتح **pgAdmin** أو **DBeaver** لتصفح قاعدة البيانات
- استخدم **React DevTools** لفحص المكونات

---

**مشكلة؟** افتح Issue على GitHub أو راجع [README.md](README.md) للمزيد من المساعدة.
