# Production Deployment Plan for PMackStack Dashboard

## Current Status Review

### ✅ What's Complete:
1. **Full Stack Application**
   - React frontend (Vite) with TypeScript
   - Express backend with PostgreSQL (Neon)
   - JWT authentication implemented
   - Role-based access control (Executive, Bookkeeper, Manager)
   - Two brands integrated: Kilwins & Renoja

2. **Authentication System**
   - JWT-based authentication (NOT Clerk as mentioned in PRD)
   - Test users already in database with password "demo123"
   - Secure bcrypt password hashing
   - Role-based middleware

3. **Features Implemented**
   - Dashboard with KPIs, charts, and filters
   - Data entry forms (manual + CSV import)
   - Store filtering by brand
   - Recent entries viewing
   - Multi-brand support with tabs

### ⚠️ What Needs Work:
1. **Git Repository** - Uncommitted changes on feature branch
2. **Environment Variables** - Missing JWT_SECRET
3. **Production Build** - Not tested
4. **Real User Accounts** - Need to create actual user accounts
5. **Domain Setup** - Need to configure GoDaddy domain
6. **Deployment** - Need to deploy to hosting service

## Deployment Plan

### Phase 1: Code Preparation & Testing (Day 1)

#### 1.1 Git Cleanup
```bash
# Commit all changes
git add -A
git commit -m "feat: Complete Renoja integration with charts and fixes"

# Merge to main branch
git checkout main
git merge feature/renoja-integration
git push origin main
```

#### 1.2 Environment Configuration
- Add JWT_SECRET to .env file
- Create .env.production with production values
- Update CORS settings for production domain

#### 1.3 Production Build Test
```bash
# Test production builds locally
cd server && npm run build
cd ../client && npm run build
```

### Phase 2: User Account Setup (Day 1)

#### 2.1 User Creation Strategy
Since this is a mom-and-pop shop, we'll keep it simple:
- Create real user accounts with temporary passwords
- Send credentials via secure email
- Force password change on first login (future enhancement)

#### 2.2 SQL Script for Real Users
```sql
-- Production users with temporary passwords
-- Password: TempPass2025! (they should change this)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('owner@clientdomain.com', '[bcrypt_hash]', 'Owner Name', 'executive'),
  ('bookkeeper@clientdomain.com', '[bcrypt_hash]', 'Bookkeeper Name', 'bookkeeper'),
  ('storemanager1@clientdomain.com', '[bcrypt_hash]', 'Manager Name 1', 'manager');

-- Assign stores to managers
INSERT INTO user_store (user_id, store_code, can_write) VALUES
  ((SELECT id FROM users WHERE email = 'storemanager1@clientdomain.com'), 'store_code', true);
```

### Phase 3: Hosting Setup (Day 2)

#### 3.1 Recommended Architecture
**Frontend:** Vercel (Free tier is sufficient)
- Automatic deployments from GitHub
- Global CDN
- SSL included

**Backend:** Railway.app or Render.com
- Better for Express apps than Vercel
- Includes PostgreSQL hosting option
- Free tier available

**Database:** Keep Neon (already configured)

#### 3.2 Alternative: Full Vercel Deployment
- Convert Express API to Vercel Functions
- Single deployment platform
- Requires some code refactoring

### Phase 4: Domain Configuration (Day 2)

#### 4.1 GoDaddy DNS Setup
1. Add A record pointing to hosting IP
2. Add CNAME for www subdomain
3. Configure SSL certificate

#### 4.2 Subdomain Strategy
```
app.clientdomain.com → Frontend
api.clientdomain.com → Backend API
```

### Phase 5: Security Hardening (Day 3)

#### 5.1 Environment Variables
- Strong JWT_SECRET (minimum 32 characters)
- Secure database connection string
- Proper CORS configuration

#### 5.2 Security Headers
- Content Security Policy
- HSTS
- X-Frame-Options
- X-Content-Type-Options

#### 5.3 Rate Limiting
- Add express-rate-limit to API
- Limit login attempts
- Limit API calls per user

### Phase 6: Testing & Validation (Day 3)

#### 6.1 Functionality Tests
- [ ] Login with each role type
- [ ] View dashboards for both brands
- [ ] Submit data entry forms
- [ ] Upload CSV files
- [ ] Check role permissions

#### 6.2 Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Charts render smoothly

#### 6.3 Security Tests
- [ ] Cannot access without login
- [ ] Cannot see unauthorized data
- [ ] JWT expiration works

### Phase 7: Deployment & Go-Live (Day 4)

#### 7.1 Deployment Steps
1. Deploy backend to hosting service
2. Deploy frontend to Vercel
3. Configure environment variables
4. Update DNS records
5. Test with production domain

#### 7.2 Client Handover
1. Create user guide document
2. Record video walkthrough
3. Schedule training session
4. Provide support contact

## Cost Analysis

### Monthly Costs (Estimated)
- **Neon Database:** Free tier (10GB storage)
- **Vercel Frontend:** Free tier
- **Backend Hosting:** ~$7/month (Railway Hobby tier)
- **Domain:** Already owned
- **Total:** ~$7/month

### Scaling Considerations
- Neon paid tier: $19/month (100GB, better performance)
- Vercel Pro: $20/month (more builds, analytics)
- Backend scaling: $20-50/month based on usage

## Immediate Action Items

1. **Commit and push current changes**
2. **Create production environment file**
3. **Generate secure JWT_SECRET**
4. **Create real user accounts SQL**
5. **Choose hosting platform**
6. **Get GoDaddy domain credentials**

## Questions to Answer Before Proceeding

1. **User Accounts:**
   - How many real users need accounts? 
   - What are their roles and store assignments?
   - Email addresses for each user?

   (1) Executive: Full Access, Admin Controls, Can Read/Write/View ALL KILWINS and RENOJA
   (2) Bookkeeper: Full Access, No User Admin Control, Can Read/Write/View ALL KILWINS and RENOJA
   (3) Annapolis Kilwins Management: Full Read/Write/View Access to Kilwins Annapolis 
   (4) Fells Point Management: Full Read/Write/View Access to Kilwins Fells Point 
   (5) Virginia Management: Full Read/Write/View Access to Kilwins in Virginia (Williamsburg, Virginia Beach, Charlottesville)
   (6) Renoja Management: Full Read/Write/View Access to All Renoja


   Will provide emails once we get this up and running and tested.

2. **Domain:**
   - What's the exact domain name? lifegivingbusiness.com
   - Do you want app.domain.com or just domain.com? Yea maybe: dashboard.lifegivingbusiness.com

3. **Hosting Preference:**
   - Simplest solution (Vercel + Railway)? 
   - Most cost-effective?
   - Easiest to maintain?

4. **Timeline:**
   - When does this need to be live?
   - Any specific deadlines?

5. **Future Features:**
   - Password reset functionality? Yes
   - Email notifications? Yes
   - Automated reports? Not yet (but tell me how to do it)

## Recommended Approach

For a mom-and-pop shop, I recommend:
1. **Keep authentication simple** - Current JWT system is fine
2. **Use managed hosting** - Vercel + Railway for simplicity
3. **Start with manual user creation** - Add self-service later
4. **Focus on reliability** over complex features
5. **Provide good documentation** and training

This approach balances functionality, security, and simplicity for a small business client. 