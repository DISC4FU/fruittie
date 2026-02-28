# Fruittie

A full-stack fruit marketplace application connecting buyers and sellers for fresh fruit trading.

## Project Overview

Fruittie is a web-based platform that enables:
- **Sellers** to list and manage fruit products
- **Buyers** to browse and purchase fruits
- **Secure authentication** with JWT tokens
- **RESTful API** backend with MongoDB database

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Responsive web design
- Dynamic UI for buyer and seller interfaces

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data persistence
- **JWT** (JSON Web Tokens) for authentication
- **bcrypt/bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas cloud account) - [Learn more](https://www.mongodb.com/)
- **Git** - [Download](https://git-scm.com/)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DISC4FU/fruittie.git
cd fruittie
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- **express** (v5.2.1) - Web framework for building REST APIs
- **mongoose** (v9.2.3) - MongoDB object modeling
- **jsonwebtoken** (v9.0.3) - JWT authentication
- **bcrypt** (v6.0.0) & **bcryptjs** (v3.0.3) - Password hashing and security
- **cors** (v2.8.6) - Cross-Origin Resource Sharing
- **dotenv** (v17.3.1) - Environment variables management
- **nodemon** (v3.1.14) - Development server auto-reload

After installation completes, you should see a `node_modules` folder and `package-lock.json` file in your project directory.

### 3. Configure Environment Variables

Create a `.env` file in the project root directory with the following variables:

```env
# MongoDB Connection URI
MONGO_URI=mongodb://localhost:27017/fruittie

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (optional - add if implementing additional JWT settings)
JWT_SECRET=your_jwt_secret_key_here
```

**For MongoDB Atlas (Cloud Database):**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fruittie?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**⚠️ Important Security Note:**
- Never commit `.env` to version control
- Add `.env` to `.gitignore`:
  ```
  .env
  .env.local
  node_modules/
  ```

### 4. Setup MongoDB

#### Option A: Local MongoDB Installation

**macOS (using Homebrew):**
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongosh
```

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service from Services or Command Prompt:
   ```bash
   mongod
   ```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud Database - Recommended for Beginners)

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Sign Up" and create an account
   - Verify your email

2. **Create a Cluster:**
   - Choose the free tier (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Allow Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Clusters" and click "Connect"
   - Choose "Drivers" and select Node.js
   - Copy the connection string
   - Update your `.env` file:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fruittie?retryWrites=true&w=majority
     ```

### 5. Verify Installation

```bash
# Check Node.js version
node --version
# Should show v14.0.0 or higher

# Check npm version
npm --version
# Should show 6.0.0 or higher

# Check MongoDB connection
mongosh
# Should connect to MongoDB shell
# Type 'exit' to quit
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start and display:
```
Server running on port 5000
MongoDB connected
```

### Production Mode

```bash
npm start
```

### Accessing the Application

Once the server is running:

- **Landing Page**: `http://localhost:5000/`
- **Buyer Interface**: `http://localhost:5000/buyer.html`
- **Seller Interface**: `http://localhost:5000/seller.html`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "userId": "user_id_here",
  "token": "jwt_token_here"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Get User Profile
```bash
GET /api/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Project Structure

```
fruittie/
├── controllers/
│   └── authcontroller.js          # Authentication business logic
├── routes/
│   └── authroutes.js              # Auth route definitions
├── models/                         # Mongoose data models
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── middlewares/
│   └── authMiddleware.js          # JWT verification
├── src/
│   └── middleware/                # Additional middleware
├── server.js                       # Express server entry point
├── package.json                    # Dependencies and npm scripts
├── package-lock.json               # Locked dependency versions
├── .env                            # Environment variables (create this)
├── .gitignore                      # Git ignore rules
├── index.html                      # Landing page
├── buyer.html                      # Buyer dashboard
├── seller.html                     # Seller dashboard
├── script.js                       # Frontend JavaScript logic
├── style.css                       # Frontend styling
└── README.md                       # This file
```

## Features

- ✅ User registration and login with JWT authentication
- ✅ Secure password hashing with bcrypt
- ✅ CORS support for frontend requests
- ✅ RESTful API architecture
- ✅ MongoDB integration
- ✅ Responsive web interface
- ✅ Separate buyer and seller dashboards
- ✅ Protected routes with middleware
- ✅ Environment-based configuration

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. Start MongoDB if it's not running:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. Verify `MONGO_URI` in `.env` is correct
4. If using MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change the port in `.env`:
   ```env
   PORT=3000
   ```

2. Or kill the process using port 5000:
   ```bash
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Module Not Found

**Error:** `Error: Cannot find module 'express'`

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Cannot Find .env File

**Error:** `Error: ENOENT: no such file or directory, open '.env'`

**Solution:** Create `.env` file in the root directory with required variables

### CORS Issues

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:** CORS is already enabled in `server.js`. If issues persist:
```javascript
// In server.js, ensure this line exists
app.use(cors());
```

### bcrypt Build Errors

**Error:** `ERR! gyp ERR! build error` related to bcrypt

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
npm install
```

## Development Tips

### Using Postman to Test API

1. Download [Postman](https://www.postman.com/downloads/)
2. Import API endpoints from collection
3. Test endpoints:
   - Register: POST request to `http://localhost:5000/api/auth/register`
   - Login: POST request to `http://localhost:5000/api/auth/login`
   - Profile: GET request with Bearer token authorization

### Enable Debug Logging

```bash
# Run with MongoDB debug
DEBUG=mongodb:* npm run dev

# Run with Express debug
DEBUG=express:* npm run dev
```

### Monitor Database Changes

```bash
# Connect to MongoDB shell
mongosh

# Switch to fruittie database
use fruittie

# View all collections
show collections

# View users
db.users.find().pretty()
```

### Auto-reload During Development

```bash
npm run dev
```

The server automatically restarts when you modify files (thanks to nodemon).

## Deployment

### Deploy to Heroku

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create Heroku app:
   ```bash
   heroku create fruittie-app
   ```

4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=mongodb+srv://...
   heroku config:set NODE_ENV=production
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

### Deploy to Railway

1. Connect GitHub account to [Railway](https://railway.app)
2. Import this repository
3. Add MongoDB plugin from Railway dashboard
4. Environment variables are auto-configured

### Using PM2 for Production

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "fruittie"

# View logs
pm2 logs fruittie

# Restart app
pm2 restart fruittie
```

## Future Enhancements

- 🔄 Implement seller product listing endpoints
- 🛒 Add buyer cart and checkout functionality
- 👨‍💼 Create admin dashboard and analytics
- 💳 Integrate payment gateway (Stripe/PayPal)
- 📱 Real-time notifications with Socket.io
- 🔍 Advanced search and filtering
- ⭐ Review and rating system
- 📦 Order tracking system

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit:
   ```bash
   git commit -m 'Add your feature description'
   ```
5. Push to branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request

## License

ISC

## Support

For issues or questions:
- 📝 Check existing issues on [GitHub Issues](https://github.com/DISC4FU/fruittie/issues)
- 🐛 Create a new issue with:
  - Clear description of the problem
  - Steps to reproduce
  - Error messages and logs
  - Your environment (Node version, OS, etc.)

---

**Happy Fruittie Trading! 🍎🍊🍌**

Made with ❤️ by DISC4FU
