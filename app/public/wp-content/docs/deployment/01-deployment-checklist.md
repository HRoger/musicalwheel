## DEPLOYMENT CHECKLIST

### WordPress Theme:
- [ ] No hardcoded paths (use WordPress constants)
- [ ] All CPTs expose GraphQL
- [ ] No dev plugin dependencies
- [ ] All code prefixed with `mw_`
- [ ] No secrets in code

### Frontend:
- [ ] All TypeScript (no `.js` files)
- [ ] Environment variables in Vercel dashboard
- [ ] `.env.example` committed
- [ ] `.env.local` NOT committed
- [ ] Tests passing
- [ ] Error boundaries implemented