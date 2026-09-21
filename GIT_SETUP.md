# 🔧 Git Setup & Push ke GitHub

Panduan lengkap untuk upload project KAS TI26A3 ke GitHub.

---

## 📋 Prerequisites

1. **Git terinstall:**
   ```bash
   git --version
   # Kalau belum ada: brew install git (macOS) atau download dari git-scm.com
   ```

2. **GitHub Account:**
   - Daftar di https://github.com (gratis)
   - Verify email

3. **SSH Key (Recommended):**
   ```bash
   # Check apakah sudah ada
   ls -la ~/.ssh/id_*.pub
   
   # Kalau belum ada, generate:
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Tekan Enter 3x (pakai default)
   
   # Copy public key
   cat ~/.ssh/id_ed25519.pub | pbcopy
   
   # Add ke GitHub:
   # 1. https://github.com/settings/keys
   # 2. New SSH Key → Paste → Add
   ```

---

## 🚀 Quick Push (5 Langkah)

### **Step 1: Buat Repo di GitHub**

1. Buka https://github.com/new
2. **Repository name:** `kas-ti26a3`
3. **Description:** "Sistem Manajemen Kas Kelas Digital - Next.js 16 + PostgreSQL"
4. **Visibility:** 
   - ✅ **Public** (recommended - bisa di-deploy gratis di Vercel)
   - atau Private (jika tidak mau public)
5. **JANGAN** centang "Add README" / ".gitignore" / "License" (sudah ada)
6. Click **Create repository**

### **Step 2: Initialize Git (kalau belum)**

```bash
cd /Users/otr1/Documents/kas-ti26a3

# Check apakah sudah git init
git status

# Kalau error "not a git repository", jalankan:
git init
```

### **Step 3: Add & Commit Files**

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit - KAS TI26A3 production ready

- Complete class cash management system
- Admin: Bills, Cash, Reports, Settings, Users, Announcements
- Student: Dashboard, Payment, Bill History
- Funding Targets feature for special events
- Dashboard widgets and analytics
- PostgreSQL + Prisma ORM
- NextAuth.js authentication
- Full CRUD APIs
- Ready for production deployment"
```

### **Step 4: Add Remote & Push**

**Ganti `YOUR_USERNAME` dengan username GitHub Anda!**

```bash
# Add remote (pilih salah satu)

# Option A: HTTPS (lebih mudah, perlu password)
git remote add origin https://github.com/YOUR_USERNAME/kas-ti26a3.git

# Option B: SSH (recommended, tidak perlu password setiap push)
git remote add origin git@github.com:YOUR_USERNAME/kas-ti26a3.git

# Set default branch
git branch -M main

# Push!
git push -u origin main
```

### **Step 5: Verify**

Buka https://github.com/YOUR_USERNAME/kas-ti26a3

✅ Cek apakah semua file sudah terupload!

---

## 🔐 Troubleshooting

### **Error: "Permission denied (publickey)"**

Artinya: SSH key belum setup atau belum di-add ke GitHub.

**Solusi:**
```bash
# Generate SSH key baru
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add ke SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Paste di GitHub: https://github.com/settings/keys
```

**Atau gunakan HTTPS:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/kas-ti26a3.git
git push -u origin main
# Input username & password (atau personal access token)
```

### **Error: "remote origin already exists"**

```bash
# Remove dan add ulang
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/kas-ti26a3.git
git push -u origin main
```

### **Error: "failed to push some refs"**

Artinya: Ada perubahan di GitHub yang belum ada di local.

```bash
# Pull dulu
git pull origin main --rebase

# Lalu push
git push -u origin main
```

### **Error: "Please tell me who you are"**

```bash
# Set global config
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# Commit ulang
git commit --amend --reset-author
```

### **File .env ikut ke-push (BAHAYA!)**

⚠️ **JANGAN PUSH FILE .env!** Berisi credentials!

```bash
# Kalau sudah terlanjur push:

# 1. Remove dari repo
git rm --cached .env
git commit -m "Remove .env from repo"
git push

# 2. Regenerate semua secrets:
# - NEXTAUTH_SECRET
# - Database password
# - API keys

# 3. Update .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push
```

---

## 📝 Git Best Practices

### **Commit Messages**

Good:
```bash
git commit -m "Add funding targets feature

- Create database schema for FundingTarget
- Implement admin CRUD APIs
- Build student contribution UI
- Add payment integration"
```

Bad:
```bash
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

### **Branching Strategy**

```bash
# Main branch untuk production
main → production ready

# Development branch
git checkout -b develop
# Work on develop, merge to main when stable

# Feature branches
git checkout -b feature/funding-targets
# Work → commit → merge to develop

# Hotfix
git checkout -b hotfix/payment-bug
# Fix → commit → merge to main & develop
```

### **Regular Commits**

Commit setiap kali ada progress:
```bash
# After completing a feature
git add .
git commit -m "Add bill creation form"
git push

# After fixing a bug
git add .
git commit -m "Fix payment verification not working"
git push

# End of day
git add .
git commit -m "WIP: Working on dashboard charts"
git push
```

---

## 🔄 Daily Workflow

### **Start of Day:**
```bash
cd /Users/otr1/Documents/kas-ti26a3
git pull origin main
npm install  # jika ada dependency baru
npm run dev
```

### **During Development:**
```bash
# Check status
git status

# See changes
git diff

# Add specific files
git add path/to/file.ts

# Or add all
git add .

# Commit
git commit -m "Descriptive message"

# Push
git push
```

### **End of Day:**
```bash
# Save all work
git add .
git commit -m "End of day commit: [what you worked on]"
git push

# Or if work not done:
git add .
git commit -m "WIP: [feature name] - [current status]"
git push
```

---

## 🌿 Branch Management

### **Create New Feature:**
```bash
# Create and switch to feature branch
git checkout -b feature/email-notifications

# Work on feature...
git add .
git commit -m "Add email notification service"

# Push feature branch
git push -u origin feature/email-notifications

# Create PR di GitHub
# Setelah approved, merge via GitHub UI

# Switch back to main
git checkout main
git pull origin main
```

### **Delete Branch:**
```bash
# Delete local branch
git branch -d feature/email-notifications

# Delete remote branch
git push origin --delete feature/email-notifications
```

---

## 🔒 Security Checklist

Sebelum push, pastikan:

- [ ] `.env` TIDAK di-commit (cek `.gitignore`)
- [ ] `node_modules/` tidak di-commit
- [ ] Tidak ada API keys hardcoded di code
- [ ] Tidak ada passwords di code
- [ ] Database credentials aman
- [ ] Secrets pakai environment variables

**Check:**
```bash
# Lihat apa yang akan di-commit
git status

# Lihat isi file yang akan di-commit
git diff

# Pastikan .env tidak ada
git ls-files | grep ".env"
# Harus kosong atau hanya .env.example
```

---

## 📦 After Push

### **Update README di GitHub:**

1. Edit README.md di GitHub web interface
2. Ganti `YOUR_USERNAME` dengan username Anda
3. Update URLs
4. Add badges (optional)

### **Setup Repository Settings:**

1. **About** (di kanan atas):
   - Description: "Sistem Manajemen Kas Kelas Digital"
   - Website: (deployment URL nanti)
   - Topics: `nextjs`, `typescript`, `prisma`, `postgresql`, `class-management`

2. **Settings → Options:**
   - ✅ Issues (untuk bug reports)
   - ✅ Discussions (untuk Q&A)

3. **Settings → Secrets** (untuk CI/CD nanti):
   - Add secrets untuk GitHub Actions

---

## 🚀 Next Steps

Setelah push ke GitHub:

1. **Deploy to Vercel:**
   - Import dari GitHub
   - Auto-deploy on push
   - See [DEPLOYMENT.md](DEPLOYMENT.md)

2. **Setup CI/CD:**
   - GitHub Actions untuk auto-test
   - Auto-deploy to staging/production

3. **Invite Collaborators:**
   - Settings → Collaborators → Add people

4. **Create First Release:**
   ```bash
   git tag -a v1.0.0 -m "First production release"
   git push origin v1.0.0
   ```

---

## 📱 GitHub Desktop (Alternative)

Kalau prefer GUI:

1. Download GitHub Desktop: https://desktop.github.com
2. Login dengan GitHub account
3. Add repository → Add Local Repository
4. Select `/Users/otr1/Documents/kas-ti26a3`
5. Publish repository
6. Commit & Push via GUI

---

## ✅ Verification Checklist

After pushing, verify:

- [ ] All files uploaded di GitHub
- [ ] README.md displayed properly
- [ ] `.env` NOT visible di GitHub
- [ ] `node_modules/` NOT uploaded
- [ ] All documentation files visible
- [ ] Repository description set
- [ ] Topics added
- [ ] License visible

---

## 💡 Tips

1. **Commit Often:**
   - Small, focused commits
   - Easier to track changes
   - Easier to revert if needed

2. **Write Good Messages:**
   - What changed
   - Why changed
   - Impact of change

3. **Use Branches:**
   - Keep main stable
   - Experiment in branches
   - Merge when ready

4. **Pull Before Push:**
   ```bash
   git pull origin main
   git push
   ```

5. **Backup:**
   - GitHub is your backup
   - But also backup database separately

---

## 🎉 Done!

Repository Anda sekarang sudah online di GitHub!

**Share dengan:**
- Teman sekelas
- Dosen
- Portfolio

**GitHub Profile:**
https://github.com/YOUR_USERNAME

**Repository:**
https://github.com/YOUR_USERNAME/kas-ti26a3

---

**Happy Coding! 🚀**
