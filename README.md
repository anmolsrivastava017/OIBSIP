🍕 PizzaHub — Artisanal Pizza Delivery Platform
Oasis Infobyte (OIBSIP) — Web Development Level 3 Internship Assessment Project
License React Node.js MongoDB Socket.IO TailwindCSS Razorpay

📌 Project Overview
PizzaHub is a production-grade, full-stack artisanal food ordering and real-time delivery platform crafted as the capstone submission for the Oasis Infobyte (OIBSIP) Web Development Level 3 internship.

The platform provides a modern 2026 digital dining experience:

Customers can browse dynamic menus with filters (categories, veg/non-veg, sorting), customize pizzas with crust sizes and gourmet add-ons, manage a responsive shopping cart, checkout via Cash on Delivery (COD) or Razorpay, and track their order through a live 5-stage pipeline powered by Socket.IO.
Administrators have a dedicated operations suite featuring real-time business KPIs, revenue telemetry, menu CRUD with image management, active stock and inventory thresholds, and one-click order status dispatching.
🚀 Key Features
🛒 Customer Experience
Landing & Discovery: High-impact dark-mode hero section with floating gradients, brand badges, popular pizza carousels, category shortcuts, coupon promos, and customer testimonials.
Smart Menu: Live search with debouncing, category tabs, veg/non-veg pills, and multiple sort parameters (price, popularity, newest).
Pizza Customization: Interactive modal/page with crust size selection (Small, Medium, Large, XL), dynamic price recalculation, optional gourmet add-ons (Extra Cheese, Jalapeños, Truffle Oil), and stock indicators.
Reactive Cart: Granular quantity adjustment, animated item deletion, subtotal calculations, dynamic delivery fees (free over ₹500), 5% GST calculation, and coupon application.
Streamlined Checkout: Form validation, persistent customer addresses, COD, and seamless Razorpay integration.
Real-Time Order Tracking: Visual 5-stage stepper (Placed → Confirmed → Preparing → Out for Delivery → Delivered) updating in real-time via WebSockets without page reload.
Customer Account: Order history with receipt cards, order item breakdowns, delivery address previews, and profile updating.
🛡️ Admin Operations
Executive Dashboard: Live metrics for total revenue, active orders, customer count, order status distribution, and low-stock alerts.
Product Catalog Management: Complete CRUD interface to create, edit, or remove pizzas with multi-size pricing and add-on configurations.
Real-Time Inventory Control: Direct stock adjustment, out-of-stock auto-toggle, and negative inventory prevention safeguards.
Order Pipeline Management: Visual order cards with one-click status transitions emitting instant WebSocket events to customer tracking views.
Category & Customer Admin: Manage menu classifications and inspect registered users with activity statistics.
🛠️ Tech Stack
Domain	Technologies
Frontend	React 19, Vite 8, Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Router v7, React Hot Toast
Backend	Node.js, Express.js, Socket.IO, Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Helmet, Morgan, Cors
Database	MongoDB (Local or MongoDB Atlas)
Payment Gateway	Razorpay SDK (with automated safe dev/mock fallback mode)
Architecture	Monorepo structured with unified root scripts
📐 System Architecture & Real-Time Flow

📁 Repository Structure
OIBSIP/
└── WebDev-L3-PizzaDelivery/
    ├── client/                      # React Frontend (Vite)
    │   ├── public/                  # Public assets & pizza.svg favicon
    │   ├── src/
    │   │   ├── components/          # Navbar, Footer, PizzaCard, ProtectedRoute
    │   │   ├── context/             # AuthContext, CartContext
    │   │   ├── layouts/             # AdminLayout (sidebar + shell)
    │   │   ├── pages/               # Home, Menu, PizzaDetail, Cart, Checkout, Login, etc.
    │   │   │   └── admin/           # Dashboard, AdminOrders, AdminProducts, etc.
    │   │   ├── services/            # Axios API client & endpoints
    │   │   ├── App.jsx              # Application router & routes
    │   │   ├── index.css            # Tailwind CSS & design tokens
    │   │   └── main.jsx             # React entry point
    │   ├── package.json
    │   └── vite.config.js           # Proxies /api and /socket.io to backend
    ├── server/                      # Node.js Express Backend
    │   ├── config/                  # Database connection (Mongoose)
    │   ├── controllers/             # Auth, Pizza, Category, Order, Payment, User
    │   ├── middleware/              # JWT auth, admin guard, error handler
    │   ├── models/                  # User, Pizza, Category, Order schemas
    │   ├── routes/                  # Express REST routes
    │   ├── utils/                   # Database seeder (seed.js)
    │   ├── .env                     # Server environment variables
    │   ├── .env.example             # Example environment template
    │   ├── package.json
    │   └── server.js                # Express & Socket.IO HTTP server
    ├── .gitignore
    ├── package.json                 # Monorepo root scripts
    └── README.md                    # Project documentation
⚡ Quick Start & Setup
1. Prerequisites
Node.js v18.0 or higher
npm v9.0 or higher
MongoDB (Local instance running at mongodb://localhost:27017 or a MongoDB Atlas URI)
2. Clone / Open Directory
cd "OIBSIP/WebDev-L3-PizzaDelivery"
3. Install Dependencies
# Install both backend and frontend dependencies
npm run install:all

# Or separately:
cd server && npm install
cd ../client && npm install
4. Configure Environment Variables
Inside server/.env:

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/pizzahub
JWT_SECRET=pizzahub_super_secret_jwt_key_2026_oibsip_level3
JWT_EXPIRE=7d

# Razorpay API Credentials (Leave defaults for automatic safe mock payment mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
5. Seed the Database
Populates the catalog with 5 categories, 12 artisanal pizzas, and demo accounts:

npm run seed
# Or: cd server && npm run seed
6. Run the Application
In terminal 1 (Backend Server):

npm run dev:server
# Server starts at http://localhost:5000
In terminal 2 (Frontend Client):

npm run dev:client
# Client starts at http://localhost:5173
🔑 Demo Credentials
For quick evaluation, pre-configured accounts are provided with one-click buttons on the Login page:

Role	Email	Password	Access Privileges
Admin	admin@pizzahub.com	Admin@123	Full access to /admin dashboard, catalog CRUD, stock management, order status changer
Customer	customer@pizzahub.com	Customer@123	Cart, checkout, profile, order history, real-time live tracking
💳 Razorpay Payment Gateway
Production & Sandbox Ready: Uses the official Razorpay Node.js SDK and Checkout modal (checkout.razorpay.com/v1/checkout.js).
Cryptographic Verification: Signatures are verified server-side with HMAC-SHA256 digest matching.
Safe Dev/Mock Mode: If custom Razorpay API keys are not supplied in .env, the system automatically activates a development mock payment pipeline that safely mimics order creation, payment response, and signature verification without failure.
📦 Inventory Management Logic
Every pizza has a discrete stock counter in MongoDB.
When an order is placed, items validate available stock. Orders exceeding stock are rejected with HTTP 400.
On order creation, item quantities are subtracted using atomic $inc: { stock: -quantity }.
If stock reaches 0, the item is automatically flagged with isAvailable: false.
Stock updates cannot decrease below 0.
Admins can adjust inventory quantities inline via the Admin Products console.
📡 API Overview
🔐 Authentication (/api/auth)
POST /api/auth/register — Register a customer account
POST /api/auth/login — Login & receive JWT bearer token
GET  /api/auth/me — Retrieve current authenticated profile
PUT  /api/auth/profile — Update user profile details
PUT  /api/auth/change-password — Change password
🍕 Pizzas (/api/pizzas)
GET    /api/pizzas — List pizzas with search, category, veg, sort, pagination
GET    /api/pizzas/:id — Get single pizza details
POST   /api/pizzas — [Admin] Create pizza item
PUT    /api/pizzas/:id — [Admin] Update pizza details
DELETE /api/pizzas/:id — [Admin] Delete pizza item
PATCH  /api/pizzas/:id/availability — [Admin] Toggle product availability
PATCH  /api/pizzas/:id/stock — [Admin] Update stock count
📁 Categories (/api/categories)
GET    /api/categories — Get active categories
POST   /api/categories — [Admin] Create category
PUT    /api/categories/:id — [Admin] Update category
DELETE /api/categories/:id — [Admin] Remove category
📦 Orders (/api/orders)
POST  /api/orders — Place order (COD or Razorpay) & decrement stock
GET   /api/orders/my — Get authenticated customer's order history
GET   /api/orders/:id — Get detailed order with status history
GET   /api/orders — [Admin] List all orders with filters & pagination
PATCH /api/orders/:id/status — [Admin] Update order status & emit Socket event
GET   /api/orders/stats — [Admin] Get executive telemetry & sales stats
💳 Payments (/api/payment)
POST /api/payment/create-order — Create Razorpay order (or mock order)
POST /api/payment/verify — Verify cryptographic HMAC-SHA256 signature
🧪 Testing & Verification Summary
All core business flows have been verified against the live environment:

=== E2E VERIFICATION RESULTS ===
[✓] 1.  Health Check Endpoint: HTTP 200 OK
[✓] 2.  Admin Login & JWT Token Generation
[✓] 3.  Customer Login & Role Verification
[✓] 4.  Pizza Catalog Retrieval (12 pizzas populated)
[✓] 5.  Category Hierarchy Retrieval (5 categories)
[✓] 6.  Order Creation with Validation & Pricing Calculation
[✓] 7.  Inventory Reduction & Stock Decrement Verification
[✓] 8.  Customer Order History Retrieval
[✓] 9.  Admin Order Status Transition to CONFIRMED
[✓] 10. Multi-stage Order Status Transition to PREPARING
[✓] 11. Admin Stock Update to Custom Threshold
[✓] 12. Admin Analytics & Revenue Aggregation
[✓] 13. Razorpay Payment Order Creation
[✓] 14. Razorpay Signature Verification & Order Marked as PAID
[✓] 15. Vite Production Build: 0 errors (built in ~3s)
🔮 Future Enhancements
Delivery rider mobile portal with geolocation GPS tracking.
Push notifications via Firebase Cloud Messaging (FCM).
Customer loyalty points & referral reward system.
Multi-branch restaurant kitchen routing.
👤 Author
Project Name: PizzaHub — Artisanal Pizza Delivery Platform
Internship: Oasis Infobyte (OIBSIP) Web Development Level 3 Assessment
Location: OIBSIP/WebDev-L3-PizzaDelivery/
