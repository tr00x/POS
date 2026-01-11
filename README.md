# Modern POS System (Point of Sale)

A comprehensive, web-based Point of Sale system built with React, Node.js, and Prisma. This application is designed to manage retail operations including sales, inventory, employee management, and delivery tracking.

## 🚀 Features

### 🛒 Cashier Interface
- **Quick Sale Processing**: Efficient product selection and checkout.
- **Barcode Scanning**: Integrated support for barcode scanners.
- **Product Catalog**: Visual product browser with search and filtering.
- **Order Management**: Handle pending and completed orders.
- **Shift Management**: Track sales per session.

### 📦 Storage & Inventory
- **Product Management**: Add, edit, and delete products.
- **Stock Tracking**: Real-time inventory monitoring.
- **Category Management**: Organize products into categories.
- **Barcode Generation**: Auto-generate barcodes for products.

### 📊 Manager Dashboard
- **Analytics**: Detailed sales charts, revenue trends, and hourly activity.
- **Employee Stats**: Track performance of cashiers and couriers (Top Cashiers).
- **Product Insights**: ABC analysis, Top Selling, and Least Selling products.
- **AI Insights**: Intelligent business suggestions and forecasting.
- **Order History**: Comprehensive view of all transactions.

### 🚚 Courier Interface
- **Delivery Tracking**: View assigned deliveries and status.
- **Order Details**: Customer information and navigation helpers.
- **Status Updates**: Real-time status changes (Picked up, Delivered).

### 🛡️ Admin & Security
- **Role-Based Access Control**: Secure login for Admin, Manager, Cashier, Courier, and Storage roles.
- **User Management**: Create and manage employee accounts.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI library.
- **Vite**: Next-generation frontend tooling.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Recharts**: Composable charting library.
- **Lucide React**: Beautiful & consistent icons.
- **Radix UI**: Unstyled, accessible UI primitives.
- **TanStack Query**: Powerful asynchronous state management.

### Backend
- **Node.js**: JavaScript runtime.
- **Express**: Fast, unopinionated web framework.
- **Prisma**: Next-generation Node.js and TypeScript ORM.
- **SQLite**: Lightweight database (easily swappable with PostgreSQL/MySQL).
- **Multer**: Middleware for handling `multipart/form-data`.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/tr00x/POS.git
cd POS
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Setup
The project uses a local SQLite database by default, so no complex DB setup is required for development.
Ensure `server/.env` exists (or create it based on requirements, usually `PORT=3000`).

### 4. Database Setup
Initialize the database and seed it with test data:
```bash
cd server
npx prisma migrate dev --name init
npm run seed
```

### 5. Running the Application

**Start Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

**Start Frontend:**
Open a new terminal:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📂 Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── admin/          # Admin dashboard & settings
│   ├── auth/           # Authentication screens
│   ├── cashier/        # POS interface components
│   ├── courier/        # Delivery management
│   ├── manager/        # Analytics & management
│   └── storage/        # Inventory control
├── components/         # Shared UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities & API configuration
└── context/            # Global state (Auth, etc.)

server/
├── prisma/             # Database schema & seeds
├── src/
│   └── index.ts        # Main server entry point
└── uploads/            # Stored images
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
