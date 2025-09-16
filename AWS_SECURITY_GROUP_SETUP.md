# 🔒 AWS Security Group Configuration Guide

## Step-by-Step Security Group Setup

### 1. During EC2 Instance Creation

When creating your EC2 instance, you'll reach the **"Configure Security Group"** step:

#### Option A: Create New Security Group (Recommended)
1. Select **"Create a new security group"**
2. Give it a name: `lti-backend-sg`
3. Description: `Security group for LTI Backend application`

#### Option B: Use Existing Security Group
1. Select **"Select an existing security group"**
2. Choose your existing group and modify it later

### 2. Configure Inbound Rules

You need to add these **4 rules** to your security group:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|---------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | Anywhere (0.0.0.0/0) | Web traffic |
| HTTPS | TCP | 443 | Anywhere (0.0.0.0/0) | Secure web traffic |
| Custom TCP | TCP | 3010 | Anywhere (0.0.0.0/0) | Backend API |

### 3. Adding Each Rule

For each rule, click **"Add Rule"** and configure:

#### Rule 1: SSH Access
- **Type**: SSH
- **Protocol**: TCP (auto-selected)
- **Port Range**: 22 (auto-selected)
- **Source**: My IP (auto-detects your current IP)
- **Description**: SSH access from my IP

#### Rule 2: HTTP Traffic
- **Type**: HTTP
- **Protocol**: TCP (auto-selected)
- **Port Range**: 80 (auto-selected)
- **Source**: Anywhere-IPv4 (0.0.0.0/0)
- **Description**: HTTP web traffic

#### Rule 3: HTTPS Traffic
- **Type**: HTTPS
- **Protocol**: TCP (auto-selected)
- **Port Range**: 443 (auto-selected)
- **Source**: Anywhere-IPv4 (0.0.0.0/0)
- **Description**: HTTPS secure web traffic

#### Rule 4: Backend API
- **Type**: Custom TCP Rule
- **Protocol**: TCP
- **Port Range**: 3010
- **Source**: Anywhere-IPv4 (0.0.0.0/0)
- **Description**: Backend API access

## 🖥️ Visual Guide

### During Instance Creation:
```
┌─────────────────────────────────────────┐
│        Configure Security Group         │
├─────────────────────────────────────────┤
│ ○ Create a new security group          │
│ ● Select an existing security group    │
│                                         │
│ Security group name: lti-backend-sg     │
│ Description: LTI Backend security group │
│                                         │
│ Inbound Rules:                          │
│ ┌─────┬─────┬──────┬──────────────────┐ │
│ │Type │Proto│Port  │Source            │ │
│ ├─────┼─────┼──────┼──────────────────┤ │
│ │SSH  │TCP  │22    │My IP             │ │
│ │HTTP │TCP  │80    │Anywhere 0.0.0.0/0│ │
│ │HTTPS│TCP  │443   │Anywhere 0.0.0.0/0│ │
│ │Custom│TCP │3010  │Anywhere 0.0.0.0/0│ │
│ └─────┴─────┴──────┴──────────────────┘ │
│                                         │
│ [Add Rule] [Remove]                     │
└─────────────────────────────────────────┘
```

## 🔧 Modifying Existing Security Group

If you need to modify an existing security group:

### 1. Navigate to Security Groups
1. AWS Console → EC2 Dashboard
2. Left sidebar → **"Security Groups"**
3. Find your security group
4. Select it and click **"Edit inbound rules"**

### 2. Add Missing Rules
1. Click **"Add rule"** for each missing port
2. Configure as shown in the table above
3. Click **"Save rules"**

## ⚠️ Security Notes

### SSH Access (Port 22)
- **Recommended**: Use "My IP" to restrict access to your current IP
- **Alternative**: Use your office/home IP range
- **Avoid**: Using 0.0.0.0/0 for SSH (security risk)

### Web Traffic (Ports 80, 443, 3010)
- **Safe**: Using 0.0.0.0/0 for web traffic
- **Purpose**: Allows users to access your application from anywhere

## 🧪 Testing Your Configuration

After setting up, test each port:

```bash
# Test SSH (should work)
ssh -i your-key.pem ec2-user@your-ec2-ip

# Test HTTP (after deployment)
curl http://your-ec2-ip:3010/health

# Test HTTPS (after SSL setup)
curl https://your-domain.com/health
```

## 🚨 Troubleshooting

### Common Issues:

**1. Can't SSH to instance**
- Check if port 22 is open to your IP
- Verify your current IP hasn't changed
- Try "Anywhere" temporarily for testing

**2. Can't access application**
- Ensure ports 80, 443, 3010 are open to 0.0.0.0/0
- Check if your application is running: `pm2 status`

**3. SSL not working**
- Verify port 443 is open
- Check if domain points to correct IP

### Quick Fix Commands:
```bash
# Check if ports are listening
sudo netstat -tlnp | grep :3010
sudo netstat -tlnp | grep :80

# Check security group from EC2
curl -s http://169.254.169.254/latest/meta-data/security-groups
```

## 📋 Final Checklist

Before proceeding with deployment, verify:
- ✅ Port 22 (SSH) - Your IP only
- ✅ Port 80 (HTTP) - Anywhere (0.0.0.0/0)
- ✅ Port 443 (HTTPS) - Anywhere (0.0.0.0/0)  
- ✅ Port 3010 (Backend) - Anywhere (0.0.0.0/0)
- ✅ Can SSH to your instance
- ✅ Security group is attached to your EC2 instance
