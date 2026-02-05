do i do # ⚡ Zest.fun - Quick Deploy Reference

## 🎯 Fastest Deploy (3 Steps)

```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy" && git push

# 2. Visit Vercel
open https://vercel.com/new

# 3. Click "Deploy"
```

## 🚀 One-Command Deploy

```bash
./deploy-vercel.sh
```

Or install Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## 📋 Environment Variables (Copy to Vercel)

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YourProgramIdHere
```

**Where to add:** Vercel Dashboard → Project Settings → Environment Variables

## ✅ Pre-Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `npm run build` works locally
- [ ] No TypeScript errors
- [ ] Environment variables ready
- [ ] Smart contract deployed (if using)

## 🌐 After Deploy

Your site will be at: `https://[your-project].vercel.app`

**Test these pages:**
- `/` - Homepage
- `/launch` - Token launcher
- `/adminwalletpswdmarishim` - Admin panel

## 🔄 Auto-Deploy

Every git push to `main` = automatic deployment!

Preview deployments for PRs too.

## 🎨 Custom Domain

Vercel Dashboard → Domains → Add Domain → Follow DNS setup

## 📊 Monitor

- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Deployments → Your Deploy → Runtime Logs
- **Errors**: Functions tab

## 🐛 Common Issues

**Build fails?**
```bash
# Update install command in Vercel
npm install --legacy-peer-deps
```

**Env vars not working?**
- Must start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding/changing

**404 errors?**
- Check routes match file structure
- Verify `next.config.ts` settings

## 🎯 Production Ready

For mainnet:

1. Deploy Anchor program to mainnet
2. Update env vars:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   ```
3. Redeploy
4. Test thoroughly!

---

**Need help?** See [DEPLOY.md](./DEPLOY.md) or [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
