# 🚀 CodeShare

> **A modern, beautiful code and text sharing platform with a stunning purple-themed UI**

Share your code snippets and text instantly with optional expiry times and view limits. Built with React, TypeScript, and Node.js.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Modern UI** | Beautiful purple & blue gradient design |
| 📝 **Instant Sharing** | Share code and text snippets with one click |
| ⏰ **Smart Expiry** | Set custom TTL (time-to-live) for snippets |
| 👁️ **View Limits** | Control how many times a snippet can be viewed |
| 🌙 **Dark Mode** | Automatic dark/light theme support |
| 📱 **Responsive** | Works perfectly on all devices |
| �  **Secure** | XSS protection and safe snippet handling |
| ⚡ **Fast** | Serverless architecture for lightning speed |

---

## 🏗️ Architecture

```
CodeShare/
├── 🎯 backend/     # Node.js API (Vercel Functions)
└── 🎨 Frontned/    # React Frontend (Vite + TypeScript)
```

**Database:** 🐘 Neon PostgreSQL (Serverless)

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Neon PostgreSQL** database ([Get free account](https://neon.tech))

### 🔧 Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# 📝 Edit .env and add your DATABASE_URL
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
TEST_MODE=1                    # Optional: Enable testing mode
BASE_URL=http://localhost:3001 # Optional: Auto-detected
```

**Start Backend:**
```bash
npm run dev
```
🌐 Backend runs on: `http://localhost:3001`

### 🎨 Frontend Setup

```bash
# Navigate to frontend
cd Frontned

# Install dependencies
npm install

# Optional: Configure API URL
echo "VITE_API_URL=http://localhost:3001" > .env
```

**Start Frontend:**
```bash
npm run dev
```
🌐 Frontend runs on: `http://localhost:5173`

---

## 🌐 Deployment

### 🚀 Deploy Backend to Vercel

1. **Push to GitHub** 📤
2. **Import** `backend` folder in Vercel
3. **Set Environment Variables:**
   ```env
   DATABASE_URL=your_neon_connection_string
   TEST_MODE=1
   BASE_URL=https://your-app.vercel.app
   ```

### 🎨 Deploy Frontend to Vercel

1. **Import** `Frontned` folder in Vercel
2. **Set Environment Variable:**
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

---

## 📡 API Reference

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/healthz` | 🏥 Health check | `{ "ok": true }` |
| `POST` | `/api/pastes` | ✨ Create snippet | `{ "id": "abc123", "url": "..." }` |
| `GET` | `/api/pastes/:id` | 📄 Get snippet (JSON) | `{ "content": "...", "remaining_views": 5 }` |
| `GET` | `/p/:id` | 🌐 View snippet (HTML) | HTML page |

### 📝 Create Snippet Example

```bash
curl -X POST http://localhost:3001/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "console.log(\"Hello CodeShare!\");",
    "ttl_seconds": 3600,
    "max_views": 10
  }'
```

---

## 🏛️ Architecture & Design

### 🎯 Key Design Decisions

| Decision | Reason | Benefit |
|----------|--------|---------|
| **🐘 Neon PostgreSQL** | Serverless compatibility | Persists data across cold starts |
| **⚡ Atomic Operations** | `UPDATE ... WHERE ... RETURNING` | Prevents race conditions |
| **🛡️ XSS Prevention** | HTML escaping | Secure snippet rendering |
| **🧪 Deterministic Testing** | `x-test-now-ms` header support | Reliable TTL testing |
| **🚀 Single Function** | All routes in one handler | Optimized cold starts |

### 🛠️ Tech Stack

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + Custom Gradients  
- 🏗️ Vite (Build Tool)
- 🎭 Lucide Icons
- 📱 Responsive Design

**Backend:**
- 🟢 Node.js + Express
- 🐘 Neon PostgreSQL
- ☁️ Vercel Serverless Functions
- 🔒 XSS Protection

---

## 📸 Screenshots

> 🎨 **Beautiful Purple Theme**
> 
> Modern gradient UI with glass-morphism effects and smooth animations

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🎨 **Tailwind CSS** for the amazing styling system
- 🐘 **Neon** for serverless PostgreSQL
- ☁️ **Vercel** for seamless deployment
- ⚛️ **React Team** for the incredible framework

---

<div align="center">

**Made with ❤️ and lots of ☕**

[⭐ Star this repo](https://github.com/yourusername/codeshare) • [🐛 Report Bug](https://github.com/yourusername/codeshare/issues) • [✨ Request Feature](https://github.com/yourusername/codeshare/issues)

</div>
