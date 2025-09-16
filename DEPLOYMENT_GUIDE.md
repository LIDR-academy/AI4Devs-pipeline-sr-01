# 🚀 EC2 Deployment Guide - Step by Step

This guide will walk you through deploying your LTI Backend to AWS EC2 with complete automation.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ AWS Account
- ✅ Domain name (optional, for SSL)
- ✅ GitHub repository with your code

## 🏗️ Step 1: Create EC2 Instance

### 1.1 Launch EC2 Instance
1. Go to AWS Console → EC2
2. Click **"Launch Instance"**
3. Choose **Amazon Linux 2** AMI
4. Select **t2.micro** (free tier) or **t3.small** (recommended)
5. Create or select a **Key Pair** (download the `.pem` file)
6. Configure Security Group with these ports:
   - **22** (SSH) - Your IP only
   - **80** (HTTP) - Anywhere (0.0.0.0/0)
   - **443** (HTTPS) - Anywhere (0.0.0.0/0)
   - **3010** (Backend) - Anywhere (0.0.0.0/0)

### 1.2 Connect to Your Instance
```bash
# Replace with your key file and instance IP
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

## 🔧 Step 2: One-Time Setup (Run Once)

### 2.1 Copy Setup Script to EC2
From your local machine:
```bash
# Copy the setup script to your EC2 instance
scp -i your-key.pem scripts/setup-ec2.sh ec2-user@your-ec2-public-ip:~/
```

### 2.2 Run the Setup Script
On your EC2 instance:
```bash
# Make it executable and run it
chmod +x setup-ec2.sh
./setup-ec2.sh
```
**What this script does:**
- ✅ Installs Node.js 18.x and npm
- ✅ Installs PM2 (process manager)
- ✅ Installs Docker and PostgreSQL
- ✅ Installs Nginx (web server)
- ✅ Installs SSL certificate tools
- ✅ Creates all necessary directories
- ✅ Sets up automatic database startup

### 2.3 Reboot Instance
```bash
sudo reboot
```

Wait 1-2 minutes, then reconnect:
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### 2.4 Start Database
```bash
./lti-backend/start-database.sh
```

## 🔐 Step 3: Configure GitHub Secrets

### 3.1 Get Your SSH Private Key Content
```bash
# On your local machine, display your private key
cat your-key.pem
```
Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

### 3.2 Add GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_SSH_PRIVATE_KEY` | Your private key content | `-----BEGIN RSA PRIVATE KEY-----\nMIIE...` |
| `EC2_INSTANCE` | Your EC2 public DNS or IP | `ec2-12-34-56-78.compute-1.amazonaws.com` |

## 🌐 Step 4: Set Up SSL (Optional but Recommended)

### 4.1 Point Your Domain to EC2
- Go to your domain registrar (GoDaddy, Namecheap, etc.)
- Create an **A record** pointing to your EC2 public IP
- Wait 5-10 minutes for DNS propagation

### 4.2 Install SSL Certificate
```bash
# On your EC2 instance
./lti-backend/setup-ssl.sh your-domain.com your-email@domain.com
```

Example:
```bash
./lti-backend/setup-ssl.sh api.myapp.com admin@myapp.com
```

## 🚀 Step 5: Deploy Your Application

### 5.1 Push to Main Branch
```bash
# On your local machine
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 5.2 Watch the Deployment
1. Go to GitHub → **Actions** tab
2. You'll see the workflow running
3. It will:
   - ✅ Run tests
   - ✅ Build your app
   - ✅ Deploy to EC2
   - ✅ Start your application

## 🎉 Step 6: Verify Deployment

### 6.1 Check Your Application
- **HTTP**: `http://your-ec2-ip:3010`
- **HTTPS** (if SSL configured): `https://your-domain.com`
- **Health Check**: `https://your-domain.com/health`

### 6.2 Check Application Status on EC2
```bash
# SSH to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Check PM2 status
pm2 status

# Check application logs
pm2 logs lti-backend

# Check database status
docker ps
```

## 🔄 Daily Operations

### Useful Commands
```bash
# Check application status
pm2 status

# Restart application
pm2 restart lti-backend

# View logs
pm2 logs lti-backend

# Check database
./lti-backend/start-database.sh

# Check SSL certificate
./lti-backend/check-ssl-renewal.sh
```

## 🆘 Troubleshooting

### Common Issues

**1. Deployment fails with SSH error**
- Check your `EC2_SSH_PRIVATE_KEY` secret is correct
- Ensure your EC2 security group allows SSH (port 22)

**2. Application not accessible**
- Check security group has ports 80, 443, 3010 open
- Verify PM2 is running: `pm2 status`

**3. Database connection error**
- Start database: `./lti-backend/start-database.sh`
- Check Docker: `docker ps`

**4. SSL certificate issues**
- Ensure domain points to EC2 IP
- Check DNS propagation: `nslookup your-domain.com`

## 📊 Summary

After completing these steps:
- ✅ Your EC2 instance is fully configured
- ✅ Database runs automatically
- ✅ SSL certificates auto-renew
- ✅ Every push to `main` branch auto-deploys
- ✅ Application runs with PM2 process management
- ✅ Nginx handles web traffic and SSL

**Total setup time: ~15 minutes**
**Future deployments: Automatic on git push**
