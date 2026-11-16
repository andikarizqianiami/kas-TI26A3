#!/bin/bash

# 🚀 Quick Ngrok Setup Script for Mac
# Untuk demo/testing aplikasi dari Mac Anda ke public

echo "🚀 Setup Ngrok untuk Demo Aplikasi"
echo "=================================="
echo ""

# Check if Homebrew installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found!"
    echo "Install Homebrew first: https://brew.sh"
    exit 1
fi

# Check if Ngrok installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing Ngrok..."
    brew install ngrok
else
    echo "✅ Ngrok already installed"
fi

echo ""
echo "📝 Setup Instructions:"
echo ""
echo "1. Daftar akun Ngrok (GRATIS):"
echo "   https://ngrok.com/signup"
echo ""
echo "2. Get your authtoken:"
echo "   https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
echo "3. Copy authtoken dan paste di sini:"
read -p "   Authtoken: " authtoken

if [ -z "$authtoken" ]; then
    echo "❌ Authtoken tidak boleh kosong!"
    exit 1
fi

# Configure Ngrok
echo ""
echo "🔧 Configuring Ngrok..."
ngrok config add-authtoken "$authtoken"

echo ""
echo "✅ Setup selesai!"
echo ""
echo "🎯 Cara menjalankan:"
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Di terminal baru, run:"
echo "   ngrok http 3000"
echo ""
echo "3. Copy URL yang muncul (contoh: https://abc123.ngrok-free.app)"
echo "4. Share URL tersebut ke teman untuk testing!"
echo ""
echo "⚠️  NOTE: URL akan berubah setiap restart (gratis version)"
echo ""
