# StyleHub - Modern E-Commerce Platform

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, Angular, Node.js) featuring a modern user interface, comprehensive admin panel, and robust backend APIs.


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


### Default Accounts (After Seeding)

After running the seed script, default accounts will be created for testing purposes.

**⚠️ IMPORTANT:** Change default passwords immediately in production environments.

- Check the seed file at `backend/src/seeds/seed.js` for default credentials
- Always use strong, unique passwords in production
- Remove or disable test accounts before deploying to production

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



## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the backend 


**🔒 Security Notes:**
- **Never commit `.env` files to version control**
- Generate strong random secrets for `JWT_SECRET` (use: `openssl rand -base64 32`)
- Use environment-specific values for production
- Keep production credentials secure and rotate regularly
- Use MongoDB Atlas or secure database hosting in production

### Frontend (environment.ts)

Create environment files in `frontend/src/environments/`:

**Development (environment.ts):**
```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api/v1",
};
```



**🔒 Security Notes:**
- Never expose sensitive API keys in frontend code
- Use server-side API keys for third-party services
- Update `apiUrl` to your production domain
- Enable HTTPS in production

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request



## 🔒 Security Best Practices

### Development
- **Never commit `.env` files** or any files containing sensitive data
- Add `.env`, `.env.local`, `*.env` to `.gitignore`
- Use environment variables for all sensitive configuration
- Keep dependencies up to date to patch security vulnerabilities
- Review code for security issues before committing

### Production Deployment
- ⚠️ **Change all default passwords immediately**
- Use strong, randomly generated secrets (minimum 32 characters)
- Generate JWT secrets: `openssl rand -base64 32`
- Enable HTTPS/SSL for all communications
- Use secure database hosting (MongoDB Atlas with authentication)
- Implement rate limiting to prevent abuse (already included)
- Enable CORS only for trusted domains
- Regularly backup your database
- Monitor logs for suspicious activities
- Use helmet.js security headers (already included)
- Implement proper input validation and sanitization
- Keep Node.js and all dependencies updated

### Password Security
- Never store passwords in plain text
- Use bcrypt for password hashing (already implemented)
- Enforce strong password policies (min 8 chars, complexity requirements)
- Implement secure password reset functionality
- Use rate limiting on authentication endpoints

### JWT Security
- Use strong, random secrets for JWT signing
- Set appropriate token expiration times (7 days default)
- Store tokens securely on the client side (httpOnly cookies recommended)
- Implement token refresh mechanism
- Invalidate tokens on logout
- Never expose JWT secrets in client-side code

### File Upload Security
- Validate file types and sizes (already implemented)
- Scan uploaded files for malware in production
- Store uploads outside the web root when possible
- Use secure, random file names
- Implement access controls for uploaded files
- Set maximum file size limits

### Database Security
- Use strong database passwords
- Enable MongoDB authentication
- Restrict database access to specific IP addresses
- Use connection strings with authentication
- Regularly backup data
- Encrypt sensitive data at rest

## Authors

- **Moamen Ahmed** - [MoamenAhmed10](https://github.com/MoamenAhmed10)

## Acknowledgments

- Angular team for the amazing framework
- Express.js community
- MongoDB team
- All contributors who help improve this project

## 📧 Support

For support, create an issue in the repository.

**Important:** Never share sensitive information (passwords, API keys, tokens) in public issues.

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
