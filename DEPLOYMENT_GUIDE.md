# 🚀 Deploy Lunar AI to Vercel - Get a Public Link in 5 Minutes

## **What You'll Get:**
A public URL like: `lunar-ai-study-partner.vercel.app`
- ✅ No Figma login required
- ✅ Works on any device
- ✅ 100% free forever
- ✅ Perfect for sharing and feedback

---

## **5-Minute Deployment Steps:**

### **Step 1: Download Your Code (2 minutes)**

1. In Figma Make, look for an **"Export"** or **"Download"** button
2. Download your project as a ZIP file
3. **Unzip the file** on your computer

**Can't find Export?** Let me know and I'll help you locate it.

---

### **Step 2: Deploy to Vercel (3 minutes)**

#### **Option A: Drag & Drop (Easiest)**

1. Go to **https://vercel.com/new**
2. Sign up with **GitHub, GitLab, or Email** (free account)
3. Click **"Browse"** or drag your project folder
4. Select your unzipped project folder
5. Click **"Deploy"**
6. Wait 1-2 minutes ⏱️
7. **Done!** Copy your public URL

#### **Option B: GitHub (Best for Updates)**

1. Create a **GitHub account** at https://github.com (if you don't have one)
2. Create a **new repository** (name it: `lunar-ai-study-partner`)
3. Upload your project files
4. Go to **https://vercel.com/new**
5. Click **"Import Git Repository"**
6. Select your GitHub repo
7. Click **"Deploy"**
8. **Done!** Copy your public URL

---

### **Step 3: Share Your Link**

Your public URL will look like:
```
https://lunar-ai-study-partner.vercel.app
```

**Share this with anyone** - no login required! 🎉

---

## **Vercel Deployment Settings (If Asked):**

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

*(Usually auto-detected, but just in case!)*

---

## **Environment Variables (Important for Backend):**

If your app uses Supabase (which it does), you need to add these:

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL = [Your Supabase URL]
VITE_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
```

**Where to find these values:**
- They're in your `/utils/supabase/info.tsx` file
- Or in your Supabase dashboard at https://supabase.com

---

## **Quick Troubleshooting:**

### **Problem: Build fails**
**Solution:** Make sure all dependencies are in package.json

### **Problem: Blank page after deploy**
**Solution:** 
1. Check browser console for errors
2. Verify environment variables are set
3. Redeploy after adding variables

### **Problem: Supabase not working**
**Solution:** Add environment variables (see above)

---

## **Alternative: Netlify (Also Free & Easy)**

If Vercel doesn't work:

1. Go to **https://app.netlify.com/drop**
2. Drag your project folder
3. Wait 1 minute
4. Get your public URL: `your-app.netlify.app`

---

## **What Your Testers Will See:**

1. Open your Vercel URL
2. See the login screen
3. Click **"🚀 Try Demo Mode"**
4. Instantly explore the app
5. No authentication, no barriers!

---

## **Next Steps After Deployment:**

1. ✅ Test your public URL yourself
2. ✅ Share it using the templates in `EMAIL_TEMPLATE.md`
3. ✅ Collect feedback via Google Form
4. ✅ Make updates by re-deploying

---

## **Need Help?**

If you get stuck at any step, let me know:
- Which step are you on?
- What error message do you see?
- Screenshot of the issue?

I'll help you troubleshoot immediately!

---

## **Video Tutorials (If You Prefer Visual):**

- **Vercel Deployment:** https://www.youtube.com/results?search_query=deploy+to+vercel
- **Netlify Deployment:** https://www.youtube.com/results?search_query=deploy+to+netlify

---

**You're almost there! One deployment and you'll have a truly public link! 🚀**
