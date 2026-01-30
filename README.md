# StyleHub - Modern E-Commerce Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, Angular, Node.js) featuring a modern user interface, comprehensive admin panel, and robust backend APIs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Angular](https://img.shields.io/badge/angular-17-red)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Features

- 🛍️ **Product Browsing**
  - Browse products by categories and subcategories
  - Advanced filtering by price, gender, and availability
  - Search functionality with real-time results
  - Product details with image gallery and reviews

- 🛒 **Shopping Cart**
  - Add/remove items from cart
  - Update quantities
  - Persistent cart (logged-in users)
  - Guest cart support with merge on login

- 📦 **Order Management**
  - Place orders with saved addresses
  - Track order status in real-time
  - Order history with detailed information
  - Cancel orders (before delivery)
  - Request returns (within 14 days)

- 👤 **User Account**
  - User registration and authentication
  - Profile management
  - Multiple delivery addresses
  - Order tracking
  - Review and testimonial submission

- ⭐ **Reviews & Ratings**
  - Write product reviews
  - Rate products (1-5 stars)
  - View aggregated ratings
  - Image uploads for reviews

### Admin Features

- 📊 **Dashboard**
  - Sales overview and statistics
  - Revenue tracking
  - User growth metrics
  - Order analytics
  - Low stock alerts

- 🏪 **Product Management**
  - Add/edit/deactivate products
  - Manage product images
  - Stock management
  - Category and subcategory organization
  - Best seller and new arrival flags

- 📋 **Order Management**
  - View all orders with filtering
  - Update order status
  - Cancel orders
  - Order details view
  - Export order reports

- 👥 **User Management**
  - View all users
  - Activate/deactivate accounts
  - User role management

- 💬 **Content Management**
  - Review approval/rejection
  - Testimonial moderation
  - Return request handling

- 📈 **Reports**
  - Sales reports with date filtering
  - Top products analytics
  - Revenue tracking
  - Export to PDF/Excel

## 🚀 Tech Stack

### Frontend

- **Framework:** Angular 17 (Standalone Components)
- **Language:** TypeScript
- **Template Engine:** External HTML Templates
- **Styling:** CSS3 with custom properties (External Stylesheets)
- **State Management:** RxJS Signals
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router
- **Forms:** Reactive Forms
- **Architecture:** Component-based with separation of concerns (TypeScript, HTML, CSS files)

### Backend

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Express Validator
- **File Upload:** Multer
- **Security:** Helmet, CORS, Express Rate Limit
- **Logging:** Morgan

### Additional Tools

- **Version Control:** Git
- **Package Managers:** npm
- **Development:** Nodemon (backend), Angular CLI (frontend)
- **Image Storage:** Local file system (uploads folder)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Angular CLI** (v17.0.0)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MoamenAhmed10/E-commerce.git
cd E-commerce
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_SECRET
# - PORT
# - NODE_ENV

# Seed the database (optional - for demo data)
npm run seed

# Start the backend server
npm start
```

The backend server will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will run on `http://localhost:4200`

## 🎯 Usage

### Running in Development Mode

**Backend:**

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**

```bash
cd frontend
npm start    # or ng serve
```

### Running in Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
# Serve the dist folder using a web server (nginx, Apache, etc.)
```

### Default Admin Account (After Seeding)

```
Email: admin@stylehub.com
Password: Admin@123
```

### Default Test User Account (After Seeding)

```
Email: test@example.com
Password: Test@123
```

## 📁 Folder Structure

```
ecommerce/
│
├── backend/                    # Backend Node.js/Express application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js          # Database connection
│   │   │   └── env.js         # Environment variables
│   │   │
│   │   ├── constants/         # Application constants
│   │   │   ├── order-status.js
│   │   │   └── roles.js
│   │   │
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/       # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── validate.middleware.js
│   │   │
│   │   ├── models/            # Mongoose models
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── order.model.js
│   │   │   ├── cart.model.js
│   │   │   └── ...
│   │   │
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── ...
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── order.service.js
│   │   │   ├── cart.service.js
│   │   │   └── ...
│   │   │
│   │   ├── validators/        # Input validation schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── product.validator.js
│   │   │   └── ...
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── helpers.js
│   │   │   ├── pagination.js
│   │   │   ├── response.js
│   │   │   └── slugify.js
│   │   │
│   │   ├── seeds/             # Database seeders
│   │   │   └── seed.js
│   │   │
│   │   ├── uploads/           # Uploaded files
│   │   │
│   │   ├── app.js             # Express app configuration
│   │   └── server.js          # Server entry point
│   │
│   ├── package.json
│   └── .env
│
├── frontend/                   # Frontend Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Core module (singleton services, guards, interceptors)
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── admin.guard.ts
│   │   │   │   │
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   └── error.interceptor.ts
│   │   │   │   │
│   │   │   │   ├── models/
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── product.service.ts
│   │   │   │       ├── order.service.ts
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── features/       # Feature modules (lazy-loaded)
│   │   │   │   ├── home/
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   ├── auth/
│   │   │   │   ├── account/
│   │   │   │   └── admin/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── products/
│   │   │   │       ├── orders/
│   │   │   │       ├── users/
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── shared/         # Shared components, directives, pipes
│   │   │   │   └── components/
│   │   │   │       ├── navbar/
│   │   │   │       ├── footer/
│   │   │   │       ├── loading/
│   │   │   │       ├── pagination/
│   │   │   │       ├── admin-sidebar/
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.ts
│   │   │
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   │
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   │
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── proxy.conf.json
│
└── README.md
```

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint                | Description       | Auth Required |
| ------ | ----------------------- | ----------------- | ------------- |
| POST   | `/api/v1/auth/register` | Register new user | No            |
| POST   | `/api/v1/auth/login`    | User login        | No            |
| GET    | `/api/v1/auth/me`       | Get current user  | Yes           |
| PUT    | `/api/v1/auth/profile`  | Update profile    | Yes           |
| PUT    | `/api/v1/auth/password` | Change password   | Yes           |

### Product Endpoints

| Method | Endpoint                             | Description          | Auth Required |
| ------ | ------------------------------------ | -------------------- | ------------- |
| GET    | `/api/v1/products`                   | Get all products     | No            |
| GET    | `/api/v1/products/:id`               | Get product by ID    | No            |
| GET    | `/api/v1/products/slug/:slug`        | Get product by slug  | No            |
| POST   | `/api/v1/products`                   | Create product       | Admin         |
| PUT    | `/api/v1/products/:id`               | Update product       | Admin         |
| PATCH  | `/api/v1/products/:id/toggle-status` | Toggle active status | Admin         |
| DELETE | `/api/v1/products/:id`               | Soft delete product  | Admin         |

### Order Endpoints

| Method | Endpoint                    | Description       | Auth Required |
| ------ | --------------------------- | ----------------- | ------------- |
| GET    | `/api/v1/orders`            | Get user orders   | User          |
| GET    | `/api/v1/orders/:id`        | Get order details | User          |
| POST   | `/api/v1/orders`            | Create order      | User          |
| PATCH  | `/api/v1/orders/:id/cancel` | Cancel order      | User          |

### Admin Endpoints

| Method | Endpoint                                | Description         | Auth Required |
| ------ | --------------------------------------- | ------------------- | ------------- |
| GET    | `/api/v1/admin/dashboard/stats`         | Get dashboard stats | Admin         |
| GET    | `/api/v1/admin/orders`                  | Get all orders      | Admin         |
| PATCH  | `/api/v1/admin/orders/:id/status`       | Update order status | Admin         |
| GET    | `/api/v1/admin/users`                   | Get all users       | Admin         |
| PATCH  | `/api/v1/admin/users/:id/toggle-status` | Toggle user status  | Admin         |

For complete API documentation, see [API_DOCS.md](./API_DOCS.md) (if available).

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:4200

# Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./src/uploads
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api/v1",
};
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Coding Standards

**Frontend:**

- Use external templates (`.html`) and stylesheets (`.css`) - no inline templates
- Follow Angular style guide
- Use standalone components
- Implement proper TypeScript typing
- Use RxJS Signals for state management
- Separate concerns: logic in `.ts`, markup in `.html`, styles in `.css`

**Backend:**

- Follow MVC pattern with service layer
- Use async/await for asynchronous operations
- Implement proper error handling
- Write meaningful variable and function names
- Add JSDoc comments for functions
- Validate all inputs using validators

**General:**

- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly
- Follow existing code structure and naming conventions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Moamen Ahmed** - [MoamenAhmed10](https://github.com/MoamenAhmed10)

## Acknowledgments

- Angular team for the amazing framework
- Express.js community
- MongoDB team
- All contributors who help improve this project

## Support

For support, email mas578272@gmail.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] SMS notifications for order updates
- [ ] Wishlist functionality
- [ ] Product comparison feature
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Social media integration
- [ ] Live chat support

---

**Made with Moamen Ahmed**
