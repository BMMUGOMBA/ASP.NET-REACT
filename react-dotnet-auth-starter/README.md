# React + .NET 8 Auth Starter

A production-grade login system with:
- ASP.NET Core Identity + JWT access tokens
- httpOnly refresh tokens with rotation & revocation
- Email confirmation & password reset (dev emails logged to console)
- React (Vite + TS), protected routes, react-hook-form + zod, Axios refresh interceptor

## Quick Start

### 1) Backend
```bash
cd AuthApi
# (optional) set a dev secret for JWT key
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "a-really-long-random-secret"
# restore & build
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```
API default: https://localhost:5001

> **Note:** If you don't have EF tools: `dotnet tool install --global dotnet-ef`

### 2) Frontend
```bash
cd auth-client
cp .env.example .env
# ensure VITE_API_URL matches your API (default https://localhost:5001/api)
npm i
npm run dev
```
Client: http://localhost:5173

### 3) Flow
- Register → Check API console for "Confirm your email" link; open it to verify.
- Login → You’ll be redirected to Dashboard.
- The client stores access token in memory; refresh token is a httpOnly cookie scoped to `/api/auth/refresh`.
- Logout → refresh cookie cleared & token revoked.

## Configuration Notes
- Update CORS in `AuthApi/appsettings.json` for different client origins.
- For **HTTP-only local dev**, set cookie `Secure=false` in `AuthController.BuildCookieOptions()` (not recommended).
- Switch to SQL Server by changing `UseSqlite` → `UseSqlServer` in `Program.cs` and connection string.

## Security TODOs for Production
- Strengthen password rules & add breach checks
- Real email provider (SendGrid/SES)
- Device/session management UI (list & revoke refresh tokens)
- 2FA (TOTP) via Identity
- Centralized error handling & structured logging
