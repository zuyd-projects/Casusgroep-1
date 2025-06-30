# 🔐 Login Problemen Oplossen - Praktische Gids

## 🎯 **Het Probleem**

De workflow demo test kan niet inloggen omdat:

- De backend server niet draait
- De test gebruiker niet bestaat
- Verkeerde credentials worden gebruikt
- Netwerk connectivity problemen

## 🎯 **Yes, E2E Tests CAN Actually Login!**

The E2E tests are fully capable of performing real authentication. Here's how:

### **Real Authentication Tests Available:**

1. **`authentication-real.cy.js`** - Basic login/logout testing
2. **`real-login-workflow.cy.js`** - Complete business workflow with authentication
3. **`authentication-debug.cy.js`** - Troubleshooting and connectivity testing

### **How Real Login Works in E2E:**

```javascript
// Method 1: Manual login (step by step)
cy.visit("/login");
cy.get('input[name="username"]').type("testuser");
cy.get('input[name="password"]').type("testpass123");
cy.get('button[type="submit"]').click();
cy.url().should("include", "/dashboard");

// Method 2: Using custom command (faster)
cy.login(); // Uses session caching for speed
```

## 🛠️ **Oplossingen**

### **Stap 1: Start de Backend Server**

```bash
# Ga naar de backend folder
cd backend

# Start de backend met Docker
docker-compose up -d

# Check of het werkt
curl http://localhost:5000/health
```

**Windows PowerShell:**

```powershell
cd backend
docker-compose up -d
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### **Stap 2: Verifieer Database & Test User**

**Optie A: Via Database Scripts**

```bash
# Voer database initialisatie uit
cd backend/scripts
# Voer init.sql en test data scripts uit
```

**Optie B: Via Registratie**

1. Start de frontend: `npm run dev`
2. Ga naar: `http://localhost:3000/register`
3. Maak een test user aan:
   - Naam: Test User
   - Email: testuser@example.com
   - Password: testpass123

### **Stap 3: Test de Login**

**Handmatig testen:**

1. Ga naar: `http://localhost:3000/login`
2. Login met: `testuser` / `testpass123`
3. Controleer of je naar dashboard gaat

**Cypress test - Real Authentication:**

```bash
# Test real login functionality
npx cypress run --spec "cypress/e2e/basic/authentication-real.cy.js"

# Test complete workflow with real login
npx cypress run --spec "cypress/e2e/basic/real-login-workflow.cy.js"

# Debug authentication issues
npx cypress run --spec "cypress/e2e/basic/authentication-debug.cy.js"

# Or open Cypress UI voor handmatige controle
npx cypress open
```

### **Stap 4: Workflow Demo Uitvoeren**

Nu de authentication werkt:

```bash
# Voer de volledige workflow demo uit
npx cypress run --spec "cypress/e2e/basic/workflow-demo.cy.js"

# Of in UI mode om visueel te volgen
npx cypress open
```

## 🔍 **Debug Commands**

**Check Backend Status:**

```bash
# Health check
curl http://localhost:5000/health

# Check if backend container runs
docker ps | grep backend
```

**Check Frontend:**

```bash
# Start frontend development server
npm run dev

# Check if frontend loads
curl http://localhost:3000

# Verify specific dashboard URLs work:
# http://localhost:3000/dashboard
# http://localhost:3000/dashboard/orders
# http://localhost:3000/dashboard/voorraadBeheer
# http://localhost:3000/dashboard/supplier
# http://localhost:3000/dashboard/plannings
# http://localhost:3000/dashboard/production-lines/1
# http://localhost:3000/dashboard/production-lines/2
# http://localhost:3000/dashboard/accountManager
# http://localhost:3000/dashboard/delivery
# http://localhost:3000/dashboard/process-mining
# http://localhost:3000/dashboard/simulations
# http://localhost:3000/dashboard/admin
```

**Database Check:**

```bash
# Connect to database (if using docker)
docker exec -it backend_db_1 psql -U postgres -d erpnumber1

# Check if users table exists
\dt
SELECT * FROM users LIMIT 5;
```

## 🎯 **Verschillende Test Scenarios**

### **Scenario 1: Backend Offline**

- **Wat gebeurt er:** Test toont frontend-only demo
- **Log output:** "🔒 Authentication required - demonstrating auth flow"
- **Oplossing:** Start backend server

### **Scenario 2: Backend Online, Geen Auth**

- **Wat gebeurt er:** Test toont volledige workflow
- **Log output:** "✅ Direct access allowed - demonstrating full workflow"
- **Resultaat:** Bezoekt alle dashboard pagina's

### **Scenario 3: Backend Online, Auth Required**

- **Wat gebeurt er:** Test toont login redirects
- **Log output:** "🔒 Authentication required - demonstrating auth flow"
- **Actie:** Handmatig inloggen vereist

## 💡 **Praktische Tips**

1. **Gebruik authentication-debug.cy.js** voor specifieke login testen
2. **Gebruik workflow-demo.cy.js** voor business process demonstratie
3. **Start altijd backend eerst** voor volledige functionaliteit
4. **Check docker logs** als backend niet start: `docker-compose logs`
5. **Gebruik Cypress UI mode** voor visuele debugging

## 🚀 **Quick Start Commando's**

```bash
# Complete setup in één keer
cd backend && docker-compose up -d
cd ../frontend && npm run dev

# Test everything
npx cypress run --spec "cypress/e2e/basic/*.cy.js"

# Open interactive mode
npx cypress open
```

Deze gids helpt je systematisch alle login problemen op te lossen! 🎉
