# DRAPE - Wear the Edit

An ultra-premium, mobile-first fashion e-commerce platform built with the full-stack MERN architecture. DRAPE delivers a hushed, high-end aesthetic inspired by luxury boutique brands natively across all viewports.

## 🚀 Tech Stack
- **Frontend**: React.js, Tailwind CSS, React Router DOM
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens) stored securely via `httpOnly` cookies
- **Payment Processing**: Razorpay API

## ✨ Key Features
- **Minimalist UI/UX Architecture**: Completely bespoke, utility-first Tailwind layouts heavily optimized for fluid breakpoints, sweeping cubic-bezier CSS animations, and premium typographic spacing to communicate brand exclusivity.
- **Role-Based Authentication**: Secure customer profiles & localized secure routing.
- **Admin Dashboard**: Full CRUD management interface for product catalogs, real-time inventory adjustments, and order state tracking.
- **Complex State Management**: Context-API driven workflows for Cart persistence, Wishlist curation, and localized Toast notification queues.
- **Frictionless Checkout**: Responsive multi-stage cart, simulated payment capturing via Razorpay, and direct real-time order generation.

## 🧠 Design Decisions & Trade-Offs

During development, we prioritized absolute performance, aesthetic luxury, and security. Here are some architectural decisions made:

1. **Tailwind CSS over Legacy CSS**: Initially scoped with standard rigid BEM-structured CSS files. We entirely refactored the structural scaffolding to Tailwind CSS utility classes. 
    - *Why?* This immediately stripped away CSS-collision errors and enabled surgical, highly responsive micro-adjustments for mobile/iPad viewports natively without bloated Media Queries.
2. **Downloadable Invoices over Automated Emails**: Originally tasked to include a Nodemailer email relay for invoices upon successful checkout. 
    - *Trade-off*: We deliberately discarded email delivery out of scope. Email delivery logic can often fail or be dropped into spam routing. Instead, we adopted an instant-gratification approach by rendering the final invoice directly on the `OrderDetailPage` where the user can immediately download it securely without leaving the application envelope.
3. **httpOnly Cookie Auth over localStorage**: 
    - *Why?* To maintain absolute security compliance, we bypassed the easier route of saving JWTs passively in `localStorage` (which is vulnerable to XSS). Instead, authorization relies entirely on strictly monitored `httpOnly` server-parsed cookies.
4. **Mobile Native Stacking**: 
    - *UX Shift*: On smaller viewports, we prioritize massive Touch Target metrics. The Call-To-Action buttons strictly stack 100% width, sidebars are hidden behind smooth modal toggles, and critical purchase actions anchor cleanly to the view-window.

## ⚙️ How to Run Locally

### 1. Environment Variables Configuration
You must create a `.env` file in the `/server` directory with the following keys:
```env
PORT=5000
MONGODB_URI=your_mongo_cloud_connection_string
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
NODE_ENV=development

# Cloudinary Setup (Required for Product Image Uploads/Generation)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Start the Platform
Run both the frontend and backend servers asynchronously:
```bash
# From the root directory:
npm run dev

# (Alternatively, run them separately)
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run start
```
