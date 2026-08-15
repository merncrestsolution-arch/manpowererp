# Production Checklist — JK Manpower ERP

Sign off each item before go-live.

## Environment

- [ ] All environment variables set in production (no dev/test values)
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] `NEXTAUTH_URL` matches production domain (https)
- [ ] `NEXTAUTH_SECRET` is a strong, unique production value (not dev placeholder)
- [ ] UploadThing production credentials configured
- [ ] SMTP configured for password reset emails

## Database

- [ ] `npx prisma migrate deploy` completed successfully
- [ ] Pre-migration backup taken and verified restorable
- [ ] Seed data removed or limited to required reference data only
- [ ] Phase 15 permissions catalog seeded

## Security

- [ ] All RBAC-sensitive routes manually spot-checked in production
- [ ] Admin credentials changed from seed defaults
- [ ] Rate limiting verified on login endpoints
- [ ] `npm audit --audit-level=high` passes
- [ ] SSL/TLS configured on the domain

## Application

- [ ] `npm run build` passes with production env
- [ ] `npm run test` passes
- [ ] PM2 configured and `pm2 save` + `pm2 startup` completed
- [ ] Nginx reverse proxy tested (HTTPS redirect from HTTP)
- [ ] Error logging configured (`src/infrastructure/logging/logger.ts` → ship logs to file/aggregator)

## Operations

- [ ] Phase 15 backup trigger verified working in production
- [ ] Backup restore procedure documented and tested once
- [ ] Rollback plan documented (`docs/deployment-guide.md`)
- [ ] Monitoring alert on PM2 process crash / disk space

## Mobile (Phase 16)

- [ ] Flutter app built with production `API_BASE_URL`
- [ ] Firebase `google-services.json` / `GoogleService-Info.plist` for production project
- [ ] Test employee login against production API

## Documentation

- [ ] `docs/security-audit-report.md` reviewed
- [ ] `docs/deployment-guide.md` followed for this environment
- [ ] Team trained on backup, migrate, and rollback procedures

---

**Signed off by:** _________________  
**Date:** _________________

_Powered by JK Manpower ERP_
