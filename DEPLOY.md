[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NexusDevelopments/Zest.fun)

# Zest.fun - Vercel Deployment Ready

This project is fully configured for one-click deployment on Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy via GitHub (Easiest)

1. **Push your code** (if not already on GitHub):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Click the Deploy button**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Click **Deploy**
   - ✅ Done! Your site will be live in ~2 minutes

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod
```

## ⚙️ Configuration Files Added

✅ **vercel.json** - Vercel deployment configuration  
✅ **.env.local** - Environment variables template  
✅ **.gitignore** - Excludes build files and secrets  
✅ **VERCEL_DEPLOYMENT.md** - Full deployment guide  

## 📝 Environment Variables

After deploying, add these in Vercel Dashboard:

**Project Settings → Environment Variables**

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YourProgramIdHere
```

Then **redeploy** for changes to take effect.

## 🌐 What Gets Deployed

- ✅ Homepage with cyan neon theme
- ✅ Token launch interface
- ✅ Admin panel with Gingerswipe security
- ✅ Wallet integration (Phantom, Solflare, etc.)
- ✅ Responsive design for all devices

## 📍 Your Live URLs

After deployment:
- **Production**: `https://zest-fun.vercel.app`
- **Homepage**: `https://zest-fun.vercel.app/`
- **Launch**: `https://zest-fun.vercel.app/launch`
- **Admin**: `https://zest-fun.vercel.app/adminwalletpswdmarishim`

## 🔒 Production Checklist

Before going to mainnet:

- [ ] Test all features on devnet deployment
- [ ] Get smart contract security audit
- [ ] Deploy Anchor program to Solana mainnet
- [ ] Update env vars to mainnet
- [ ] Set up custom domain (optional)
- [ ] Enable analytics in Vercel dashboard

## 💡 Pro Tips

1. **Auto-Deploy**: Every push to `main` = automatic deployment
2. **Preview Deploys**: Pull requests get their own preview URL
3. **Rollbacks**: Instant rollback to any previous deployment
4. **Custom Domain**: Add `zest.fun` in Vercel dashboard → Domains

## Need Help?

- See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed guide
- Check [Vercel Docs](https://vercel.com/docs)
- Visit [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Ready to deploy!** Just push to GitHub and connect to Vercel. 🎉
