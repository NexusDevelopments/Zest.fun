# 🚀 Deploying Zest.fun to Vercel

## Quick Deploy (Recommended)

### Method 1: Deploy via GitHub

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your `Zest.fun` GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Set Environment Variables** (in Vercel Dashboard):
   - Go to Project Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SOLANA_NETWORK` = `devnet`
     - `NEXT_PUBLIC_RPC_ENDPOINT` = `https://api.devnet.solana.com`
     - `NEXT_PUBLIC_PROGRAM_ID` = Your deployed Anchor program ID

4. **Redeploy** after adding env variables:
   - Vercel → Deployments → Click "..." → Redeploy

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Configuration Details

### ✅ Already Configured

Your project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ `next.config.ts` - Next.js settings
- ✅ `.env.local` - Local environment variables
- ✅ `.gitignore` - Excludes sensitive files
- ✅ Build optimizations

### Environment Variables

**Development (Devnet):**
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

**Production (Mainnet):**
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

### Custom Domain Setup

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `zest.fun`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cnd.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Code pushed to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Anchor program deployed to Solana (if using smart contracts)
- [ ] Program ID updated in environment variables

## Build Commands

Vercel will automatically use:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "outputDirectory": ".next"
}
```

## Performance Optimizations

Your project includes:
- ✅ Automatic image optimization
- ✅ Font optimization (Geist)
- ✅ Code splitting
- ✅ Edge runtime support
- ✅ Static generation where possible

## Troubleshooting

### Build Fails on Vercel

**Issue**: Peer dependency errors
```bash
# In Vercel Dashboard → Settings → General → Build & Development Settings
# Override Install Command with:
npm install --legacy-peer-deps
```

**Issue**: TypeScript errors
```bash
# Run locally first:
npm run build

# Fix any errors shown
```

### Environment Variables Not Working

1. Make sure they start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding/changing variables
3. Clear cache: Deployments → Redeploy → Clear Cache

### Smart Contract Not Connecting

1. Verify `NEXT_PUBLIC_PROGRAM_ID` is set
2. Check network matches (devnet vs mainnet)
3. Ensure RPC endpoint is accessible
4. Check browser console for errors

## Using Custom RPC (Recommended for Production)

Free tier public RPCs can be slow. Use:

**QuickNode** (Fast):
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://your-endpoint.solana-mainnet.quiknode.pro/
```

**Helius** (Generous free tier):
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

**Alchemy**:
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

## Post-Deployment

1. **Test the live site**:
   - Visit your Vercel URL
   - Connect a wallet
   - Test all features

2. **Monitor**:
   - Vercel Dashboard → Analytics
   - Check error logs
   - Monitor build times

3. **Set up domains**:
   - Add custom domain in Vercel
   - Enable HTTPS (automatic)
   - Set up redirects if needed

## Going to Mainnet

When ready for production:

1. **Deploy Smart Contract to Mainnet**:
   ```bash
   solana config set --url mainnet-beta
   anchor build
   anchor deploy
   ```

2. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_PROGRAM_ID=YourMainnetProgramID
   ```

3. **Redeploy on Vercel**

4. **Security Audit**: Get smart contracts audited before mainnet!

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Solana Deployment**: [docs.solana.com](https://docs.solana.com)

---

**Your Zest.fun is now ready for deployment!** 🎉
