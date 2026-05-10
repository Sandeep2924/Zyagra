# 🌾 Zyagra - Farm-to-Table E-Commerce Platform

A modern, full-stack e-commerce application built with **React (Vite)** frontend and **Node.js/Express** backend, specifically designed for direct farming operations and agricultural product sales.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Login Types & Authentication](#login-types--authentication)
4. [Database Structure](#database-structure)
5. [Setup & Installation](#setup--installation)
6. [API Endpoints](#api-endpoints)
7. [Project Features](#project-features)
8. [Directory Structure](#directory-structure)

---

## 🎯 Project Overview

**Zyagra** is an e-commerce platform that connects farmers directly with customers. It features:

- **Dual Login System**: Separate authentication for regular users and administrators
- **Product Marketplace**: Browse and purchase agricultural products
- **Shopping Cart & Checkout**: Complete e-commerce workflow
- **Order Management**: Track orders and delivery status
- **Admin Dashboard**: Manage products, orders, and users
- **User Profile Management**: Store shipping addresses and order history
- **Wishlist System**: Save favorite products for later

---

## 🛠 Technology Stack

### Frontend
- **React 19.1.1** - UI library with hooks
- **Vite** - Lightning-fast build tool
- **React Router DOM 7.9.1** - Client-side routing
- **Axios 1.12.2** - HTTP client for API calls
- **Chart.js & React-ChartJS-2** - Data visualization
- **React Icons** - Icon library

### Backend
- **Node.js & Express 5.1.0** - Web server framework
- **MongoDB & Mongoose 8.19.0** - NoSQL database and ODM
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcryptjs 3.0.2** - Password encryption
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variable management
- **Nodemon** - Development server with auto-reload

---

## 🔐 Login Types & Authentication

### **1. User Login (Regular Customers)**

#### Registration Process (`/api/users/register`)
```
POST Request Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securePassword123",
  "address": "123 Main Street",
  "city": "Springfield",
  "postalCode": "12345"
}

Response:
{
  "message": "Welcome to Zyagra! You can now log in."
}
```

**Validation Rules for Users:**
- ✅ Full Name: Required, non-empty string
- ✅ Email: Required, unique, valid email format
- ✅ Phone: Required, unique, exactly 10 digits (numeric)
- ✅ Password: Required, minimum 6 characters
- ✅ Shipping Address: Complete address (street, city, postal code)

#### Login Process (`/api/users/login`)
```
POST Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response on Success:
{
  "id": "user_mongodb_id",
  "message": "Login successful! Welcome back.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
}

Response on Failure:
{
  "message": "Sorry, we don't recognize that email." 
  // OR
  "message": "Incorrect password."
}
```

**Token Details:**
- **Expiration**: 24 hours
- **Payload Includes**: User ID and login message
- **Storage**: Stored in localStorage on client-side

#### User Details Retrieval (`/api/users/userdetails`)
```
GET Request:
/api/users/userdetails?id=user_mongodb_id

Response:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "shippingAddress": {
    "address": "123 Main Street",
    "city": "Springfield",
    "postalCode": "12345"
  },
  "phone": "1234567890"
}
```

---

### **2. Admin Login (Store Managers/Administrators)**

#### Admin Registration (`/api/admins/register`)
```
POST Request Body:
{
  "email": "admin@zyagra.com",
  "password": "adminPassword123"
}

Response:
{
  "message": "Admin registered successfully.",
  "admin": {
    "id": "admin_mongodb_id",
    "email": "admin@zyagra.com",
    "role": "admin"
  }
}
```

**Validation Rules for Admins:**
- ✅ Email: Required, unique, valid email format
- ✅ Password: Required, minimum 6 characters
- ✅ Role: Defaults to "admin" or can be "super-admin"
- ✅ Account Status: Must be active to login

#### Admin Login (`/api/admins/login`)
```
POST Request Body:
{
  "email": "admin@zyagra.com",
  "password": "adminPassword123"
}

Response on Success:
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...",
  "admin": {
    "id": "admin_mongodb_id",
    "email": "admin@zyagra.com",
    "role": "admin",
    "lastLogin": "2026-05-09T10:30:00.000Z"
  }
}

Response on Failure:
{
  "message": "Invalid credentials." // Email or password incorrect
  // OR
  "message": "Account is deactivated." // Admin account inactive
}
```

**Token Details:**
- **Expiration**: 24 hours
- **Payload Includes**: Admin ID, email, role, and isAdmin flag
- **Storage**: Stored in localStorage on client-side

#### Admin Profile (`/api/admins/profile`)
```
GET Request:
Authorization Header: "Bearer <admin_token>"

Response:
{
  "message": "Admin profile retrieved successfully.",
  "admin": {
    "id": "admin_mongodb_id",
    "email": "admin@zyagra.com",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2026-05-09T10:30:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
}
```

---

### **3. Authentication Security Features**

#### Password Encryption
- **Algorithm**: bcryptjs with salt rounds
  - Users: 10 salt rounds
  - Admins: 12 salt rounds (stronger)
- **Storage**: Passwords are hashed before database storage
- **Verification**: bcrypt.compare() used during login

#### JWT Token System
- **Secret**: Stored in `.env` as `JWT_SECRET`
- **Standard**: Uses HS256 algorithm
- **Bearer Token**: Sent as `Authorization: Bearer <token>`
- **Token Validation**: Verified on protected routes

#### Protected Routes (Admin Only)
- Admin operations require valid JWT token
- Role-based access control (RBAC)
- Token verified via middleware before processing requests

---

## 📊 Database Structure

### MongoDB Collections

The project uses MongoDB with Mongoose ORM. Here's the complete schema structure:

---

### **1. User Collection**

Stores customer account information and profiles.

```javascript
{
  _id: ObjectId,
  fullName: String (required),
  email: String (required, unique, email format),
  phone: String (required, unique, 10 digits),
  password: String (required, hashed, min 6 chars),
  shippingAddress: {
    address: String (required),
    city: String (required),
    postalCode: String (required)
  },
  role: String (enum: ["user", "admin"], default: "user"),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "password": "$2a$10$...", // bcrypt hashed
  "shippingAddress": {
    "address": "42 Farm Road",
    "city": "Punjab",
    "postalCode": "160012"
  },
  "role": "user",
  "createdAt": "2026-05-01T10:00:00.000Z",
  "updatedAt": "2026-05-08T15:30:00.000Z"
}
```

**Indexes:**
- `email`: unique index
- `phone`: unique index

---

### **2. Admin Collection**

Stores administrator account information with enhanced security tracking.

```javascript
{
  _id: ObjectId,
  email: String (required, unique, email format),
  password: String (required, hashed, min 6 chars),
  role: String (enum: ["admin", "super-admin"], default: "admin"),
  isActive: Boolean (default: true),
  lastLogin: Date (tracks last login time),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "email": "admin@zyagra.com",
  "password": "$2a$12$...", // bcrypt hashed (12 rounds)
  "role": "admin",
  "isActive": true,
  "lastLogin": "2026-05-09T14:20:00.000Z",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-05-09T14:20:00.000Z"
}
```

**Key Features:**
- `isActive`: Allows account deactivation without deletion
- `lastLogin`: Audit trail of admin access
- Methods: `comparePassword()`, `updateLastLogin()`

---

### **3. Product Collection**

Stores agricultural product listings.

```javascript
{
  _id: ObjectId,
  name: String (required),
  image: String (required, URL),
  description: String (required),
  price: Number (required),
  quantity: String (required, e.g., "500 ml", "1 dozen"),
  category: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Organic Farm Fresh Milk",
  "image": "https://cdn.example.com/milk.jpg",
  "description": "100% pure, fresh milk from grass-fed cows",
  "price": 80,
  "quantity": "1 Liter",
  "category": "Dairy",
  "createdAt": "2026-02-10T12:00:00.000Z",
  "updatedAt": "2026-05-08T10:00:00.000Z"
}
```

**Categories Include:**
- Dairy Products
- Vegetables
- Fruits
- Grains
- Spices
- Honey & Preserves

---

### **4. Order Collection**

Stores customer orders with complete transaction details.

```javascript
{
  _id: ObjectId,
  user: ObjectId (required, ref: "User"), // Links to User document
  orderItems: [
    {
      name: String (required),
      qty: Number (required),
      image: String (required),
      price: Number (required),
      product: ObjectId (required, ref: "Product")
    }
  ],
  shippingAddress: {
    address: String (required),
    city: String (required),
    postalCode: String (required)
  },
  phone: String (required, default: "0000000000"),
  paymentMethod: String (required, default: "Cash on Delivery"),
  totalPrice: Number (required, default: 0.0),
  isPaid: Boolean (required, default: false),
  paidAt: Date (optional),
  isDelivered: Boolean (required, default: false),
  deliveredAt: Date (optional),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "user": "507f1f77bcf86cd799439011",
  "orderItems": [
    {
      "name": "Organic Farm Fresh Milk",
      "qty": 2,
      "image": "https://cdn.example.com/milk.jpg",
      "price": 80,
      "product": "507f1f77bcf86cd799439013"
    }
  ],
  "shippingAddress": {
    "address": "42 Farm Road",
    "city": "Punjab",
    "postalCode": "160012"
  },
  "phone": "9876543210",
  "paymentMethod": "Cash on Delivery",
  "totalPrice": 160,
  "isPaid": false,
  "paidAt": null,
  "isDelivered": false,
  "deliveredAt": null,
  "createdAt": "2026-05-08T14:30:00.000Z",
  "updatedAt": "2026-05-08T14:30:00.000Z"
}
```

**Relationships:**
- **user**: References User collection (one-to-many relationship)
- **product** (in orderItems): References Product collection

**Order Workflow:**
1. User creates order → `isPaid: false`, `isDelivered: false`
2. Payment confirmed → `isPaid: true`, `paidAt: timestamp`
3. Order shipped → Admin updates
4. Order delivered → `isDelivered: true`, `deliveredAt: timestamp`

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

### **Backend Setup**

1. **Navigate to Server Directory**
```bash
cd Server
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create Environment File (.env)**
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/zyagra
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. **Start the Server**
```bash
npm start
```

Server runs on `http://localhost:5000` (or configured port)

---

### **Frontend Setup**

1. **Navigate to Client Directory**
```bash
cd Client
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Development Server**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### **User Authentication Routes** (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user account | ❌ No |
| POST | `/login` | Login with email & password | ❌ No |
| GET | `/userdetails?id=<userId>` | Get user profile details | ❌ No |

### **Admin Authentication Routes** (`/api/admins`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new admin account | ❌ No |
| POST | `/login` | Admin login | ❌ No |
| GET | `/profile` | Get admin profile (protected) | ✅ Yes (JWT) |

### **Product Routes** (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Fetch all products | ❌ No |
| POST | `/` | Create new product | ✅ Yes (Admin) |
| PUT | `/:id` | Update product | ✅ Yes (Admin) |
| DELETE | `/:id` | Delete product | ✅ Yes (Admin) |

### **Order Routes** (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all orders (admin) | ✅ Yes (Admin) |
| POST | `/` | Create new order | ✅ Yes (User) |
| GET | `/:id` | Get order details | ✅ Yes (User/Admin) |
| PUT | `/:id` | Update order status | ✅ Yes (Admin) |

---

## ✨ Project Features

### **For Customers**
- 🔐 Secure registration and login with email verification
- 🛒 Add products to shopping cart
- ❤️ Wishlist management
- 📦 Place and track orders
- 👤 Manage user profile and shipping addresses
- 📊 View order history and payment status

### **For Administrators**
- 📋 Dashboard with analytics (Chart.js integration)
- 📦 Product management (CRUD operations)
- 👥 User management
- 📊 Order management and fulfillment tracking
- 🔒 Secure admin authentication with role-based access
- 👁️ Track admin last login

### **Security & Authentication**
- ✅ Password encryption with bcryptjs
- ✅ JWT-based token authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Email & phone uniqueness validation
- ✅ Account activity tracking

---

## 📁 Directory Structure

```
Zyagra/
│
├── Client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── AdminLoginPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ClientHomePage.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── MyOrdersPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   └── ...
│   │   ├── style/                   # CSS stylesheets
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── Server/                          # Node.js/Express Backend
│   ├── models/                      # Mongoose Schemas
│   │   ├── userModel.js
│   │   ├── adminModel.js
│   │   ├── productModel.js
│   │   └── orderModel.js
│   ├── routes/                      # Express Routes
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── createAdmin.js
│   ├── server.js                    # Main server file
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── node_modules/
│
└── README.md                        # This file
```

---

## 🔑 Key Files Explained

### **Backend**
- **server.js** - Main Express server configuration, middleware setup, and route mounting
- **models/** - Mongoose schemas defining database structure
- **routes/** - API endpoint handlers with business logic

### **Frontend**
- **App.jsx** - Main React application component with routing
- **AuthContext.jsx** - Global authentication state management
- **CartContext.jsx** - Shopping cart state management
- **pages/** - Individual page components for different routes
- **components/** - Reusable React components

---

## 🌍 Environment Variables

Create a `.env` file in the Server directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/zyagra

# JWT Secret
JWT_SECRET=your_very_secure_random_string_here

# Node Environment
NODE_ENV=development
```

**Important:** Never commit `.env` file with sensitive data. Add it to `.gitignore`.

---

## 📝 Notes

### **Database**
- MongoDB Atlas cloud database is configured
- Connection string uses credentials (keep `.env` secure)
- Database name: `zyagra`

### **Authentication Flow**
1. User registers with email, phone, password
2. Password is hashed using bcryptjs
3. User logs in with email and password
4. Server verifies credentials and generates JWT token
5. Token is sent to client and stored in localStorage
6. Token is included in Authorization header for protected routes

### **Password Security**
- User passwords: bcryptjs with 10 salt rounds
- Admin passwords: bcryptjs with 12 salt rounds (stronger)
- Passwords are never stored in plain text

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Database Connection Error**
   - Verify MongoDB URI in `.env`
   - Check network access in MongoDB Atlas
   - Ensure cluster is active

2. **JWT Token Invalid**
   - Verify `JWT_SECRET` matches in server
   - Check token expiration (24 hours)
   - Ensure token format is correct in headers

3. **CORS Error**
   - Frontend and backend must be on correct URLs
   - CORS is enabled in server.js
   - Check browser console for detailed error

4. **Password Mismatch During Login**
   - Verify email exists in database
   - Ensure password is correct (case-sensitive)
   - Check if account was created successfully

---

## 📞 Support

For issues or questions regarding the authentication system, database structure, or API endpoints, refer to the respective route files and models in the `Server/routes/` and `Server/models/` directories.

---

**Created**: May 2026  
**Project**: Zyagra - Farm-to-Table E-Commerce Platform  
**Version**: 1.0.0
