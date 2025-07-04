# Frontend Getting Started Guide

This guide will help you set up and run the ERPNumber1 Next.js frontend application from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18.0+ recommended, v22.0+ for optimal performance)

  - [Download for Windows](https://nodejs.org/dist/v22.13.0/node-v22.13.0-x64.msi)
  - [Download for macOS](https://nodejs.org/dist/v22.13.0/node-v22.13.0.pkg)
  - [Download for Linux](https://nodejs.org/en/download/)

- **npm** (comes with Node.js) or **yarn** package manager

- **Docker Desktop** (v4.0+) - for containerized deployment

  - [Download for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
  - [Download for macOS](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

- **Git** (for version control)
  - [Download here](https://git-scm.com/downloads)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended (for development and testing)
- **Storage**: 2GB free space for dependencies and build artifacts
- **OS**: Windows 10+, macOS 10.15+, or modern Linux distribution
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## 🚀 Quick Start (3 minutes)

### Option 1: Docker (Recommended for Production)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Start the frontend container**

   ```bash
   docker build -t erp-frontend .
   docker run -p 3000:3000 -e BACKEND_URL=http://localhost:8080 erp-frontend
   ```

3. **Verify the setup**

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Health Check: Browser should show ERP dashboard

**That's it!** The frontend is now running and connected to your backend API.

### Option 2: Local Development (Recommended for Development)

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**

   ```bash
   # For development with local backend
   npm run dev

   # Or with specific backend URL
   npm run dev:docker  # Backend on localhost:8080
   npm run dev:local   # Backend on localhost:5045
   ```

3. **Access the application**

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Hot Reload: Automatic page refresh on code changes

## 🔧 Configuration

### Environment Variables

The frontend supports these environment variables:

```bash
# Backend API Configuration
BACKEND_URL="http://localhost:8080"           # Backend API base URL
NEXT_PUBLIC_API_URL="http://localhost:8080"   # Public API URL for client-side

# Development Configuration
NODE_ENV="development"                        # Environment mode
NEXT_TELEMETRY_DISABLED=1                    # Disable Next.js telemetry

# Production Configuration
PORT=3000                                     # Frontend port
HOSTNAME="0.0.0.0"                           # Bind address
```

### Next.js Configuration

The `next.config.mjs` file includes:

- **Standalone Output**: Optimized for Docker deployment
- **API Proxy**: Automatic backend API routing
- **SignalR Support**: Real-time WebSocket communication
- **Environment Detection**: Automatic backend URL selection

### Backend API Integration

The frontend automatically proxies API requests:

- **API Routes**: `/api/*` → `${BACKEND_URL}/api/*`
- **SignalR Hub**: `/simulationHub/*` → `${BACKEND_URL}/simulationHub/*`
- **Timeout**: 10 minutes for long-running operations

## 🧪 Testing the Setup

### 1. Frontend Health Check

```bash
curl http://localhost:3000
```

**Expected Response**: HTML page with ERP dashboard

### 2. API Proxy Test

```bash
curl http://localhost:3000/api/health
```

**Expected Response**: Backend API health status

### 3. Test User Interface

1. **Navigate to Dashboard**

   ```bash
   # Open in browser
   http://localhost:3000/dashboard
   ```

2. **Test Department Pages**

   ```bash
   # Test various department dashboards
   http://localhost:3000/dashboard/orders
   http://localhost:3000/dashboard/voorraadBeheer
   http://localhost:3000/dashboard/production-lines/1
   ```

3. **Test Authentication Flow**
   ```bash
   # Test login page
   http://localhost:3000/login
   ```

## 📊 Enable Real-time Features

Real-time features are automatically enabled when you start the frontend. To verify:

### 1. SignalR Connection Test

Open browser console and check for:

```javascript
// Check SignalR connection
console.log("SignalR Status:", window.signalRConnection?.state);
```

### 2. Dashboard Real-time Updates

1. **Open Dashboard**: Navigate to `http://localhost:3000/dashboard`
2. **Start Simulation**: Use the simulation controls
3. **Observe Updates**: Order statuses and metrics update automatically

### 3. Production Line Monitoring

```bash
# Access production lines for real-time monitoring
http://localhost:3000/dashboard/production-lines/1
http://localhost:3000/dashboard/production-lines/2
```

## 🛠️ Development Setup

### IDE Setup

**Visual Studio Code** (Recommended):

1. Install essential extensions:

   ```bash
   # Install via VS Code Extensions marketplace
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Next.js snippets
   - Cypress Snippets
   - Auto Rename Tag
   ```

2. Open the workspace:

   ```bash
   code .
   ```

3. Configure VS Code settings (`.vscode/settings.json`):
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

**Alternative Editors**:

- **WebStorm**: Full Next.js support with intelligent code completion
- **Sublime Text**: With React and Tailwind CSS packages

### Hot Reload Development

For rapid development with automatic rebuilds:

```bash
# Terminal 1: Start backend (if running locally)
cd ../backend
docker-compose up

# Terminal 2: Start frontend with hot reload
cd frontend
npm run dev

# Changes to any file automatically reload the page
```

### Build Optimization

For production builds and testing:

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:

```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Use different port
PORT=3001 npm run dev

# Kill existing process
npx kill-port 3000
```

#### 2. Backend Connection Failed

**Error**: `Cannot connect to backend API`

**Solutions**:

```bash
# Check backend is running
curl http://localhost:8080/api/health

# Verify environment variables
echo $BACKEND_URL

# Update backend URL
BACKEND_URL=http://localhost:5045 npm run dev

# Check Next.js proxy configuration
cat next.config.mjs
```

#### 3. Build Errors

**Error**: `Build failed with TypeScript/ESLint errors`

**Common Fixes**:

```bash
# Clean dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update

# Fix ESLint errors
npm run lint -- --fix

# Skip type checking for quick build (not recommended)
npm run build -- --no-lint
```

#### 4. Styling Issues

**Error**: `Tailwind CSS not working`

**Solutions**:

```bash
# Rebuild Tailwind CSS
npx tailwindcss build

# Check PostCSS configuration
cat postcss.config.js

# Verify Tailwind config
npx tailwindcss --help

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Development Debugging

#### 1. Browser Developer Tools

```javascript
// Check API calls in Network tab
// Inspect React components in React DevTools
// Monitor console for errors and warnings

// Debug SignalR connection
console.log("SignalR Connection:", window.signalRConnection);
```

#### 2. Next.js Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Check build output
npm run build -- --debug

# Analyze bundle
ANALYZE=true npm run build
```

## 🧪 Running Tests

### E2E Testing with Cypress

The frontend includes comprehensive E2E tests covering the complete business workflow:

```bash
# Install Cypress (if not already installed)
npm install

# Run E2E tests headlessly
npm run test:e2e

# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run specific test categories
npm run test:auth          # Authentication tests
npm run test:orders        # Order management tests
npm run test:dashboard     # Dashboard functionality tests

# Run tests with different browsers
npm run test:e2e:chrome    # Chrome browser
npm run test:e2e:firefox   # Firefox browser
```

### Component Testing

```bash
# Run component tests
npm run test:component

# Open component test runner
npm run cypress:open --component

# Test specific components
npx cypress run --component --spec "src/components/test/Header.cy.js"
```

### Test Results

Current test coverage:

- **E2E Tests**: 22 tests covering complete business workflows
- **Component Tests**: 141 tests covering UI components
- **Success Rate**: 100% (22/22 E2E), 95.7% (135/141 component)

## 📦 Package Management

### Dependencies Overview

**Core Framework**:

- `next` (v15.3.3): React framework with SSR/SSG
- `react` (v19.1.0): Core React library
- `react-dom` (v19.1.0): React DOM rendering

**UI & Styling**:

- `tailwindcss` (v4.1.8): Utility-first CSS framework
- `lucide-react` (v0.513.0): Modern icon library
- `autoprefixer` (v10.4.21): CSS vendor prefixing

**Data Visualization**:

- `recharts` (v2.15.4): React chart library for analytics

**Real-time Communication**:

- `@microsoft/signalr` (v8.0.7): SignalR client for WebSocket

**Testing**:

- `cypress` (v14.5.0): E2E and component testing

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies (careful with major versions)
npm update

# Update specific package
npm install package-name@latest

# Security audit
npm audit
npm audit fix
```

## 🐳 Docker Configuration

### Development Docker Setup

```dockerfile
# Multi-stage build for optimization
FROM node:22-alpine AS base
FROM base AS deps         # Install dependencies
FROM base AS builder      # Build application
FROM base AS frontend     # Production runtime
```

### Production Deployment

```bash
# Build production image
docker build -t erp-frontend:latest .

# Run with environment variables
docker run -d \
  --name erp-frontend \
  -p 3000:3000 \
  -e BACKEND_URL=http://your-backend:8080 \
  -e NODE_ENV=production \
  erp-frontend:latest

# Check container logs
docker logs erp-frontend

# Scale for load balancing
docker run --replicas=3 erp-frontend:latest
```

### Docker Compose Integration

```yaml
# docker-compose.yml example
version: "3.8"
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8080
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
```

## 📊 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Enable compression
# (automatically enabled in production)

# Optimize images
# Place optimized images in /public/
```

### Runtime Performance

1. **Code Splitting**: Automatic with Next.js App Router
2. **Image Optimization**: Use `next/image` component
3. **Font Optimization**: Configured with `@next/font`
4. **Caching**: Static assets cached automatically

### Memory Settings

For large datasets in development:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Monitor memory usage
npm run dev -- --inspect
```

## 🎯 Success Checklist

- [ ] Node.js (v18+) is installed
- [ ] Dependencies installed successfully (`npm install`)
- [ ] Development server starts (`npm run dev`)
- [ ] Frontend accessible on port 3000
- [ ] Backend API proxy working (`/api/*`)
- [ ] Authentication flow functional
- [ ] Dashboard loads with department pages
- [ ] Real-time features working (SignalR)
- [ ] E2E tests passing (22/22 tests)
- [ ] Production build successful (`npm run build`)
- [ ] Docker build working (optional)

**Congratulations!** Your ERPNumber1 frontend is now ready for development and production use.

---

## 🔗 Related Documentation

- [Frontend Testing Guide](../test/README.md)
- [Backend API Documentation](../../backend/api-usage/README.md)
- [Process Mining Frontend Integration](../process-mining-frontend.md)
- [Backend Getting Started](../../backend/setup/getting-started.md)
