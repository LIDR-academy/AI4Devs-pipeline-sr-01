#!/bin/bash
set -e

echo "🚀 Starting EC2 setup for LTI Backend deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js installed: $node_version"
echo "✅ npm installed: $npm_version"

# Install PM2 globally
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Setup PM2 to start on boot
sudo pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

echo "✅ PM2 installed and configured for auto-start"

# Install Docker and Docker Compose for database
echo "📦 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "✅ Docker and Docker Compose installed"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ec2-user/lti-backend
chown ec2-user:ec2-user /home/ec2-user/lti-backend

# Create database directory and docker-compose file
echo "📁 Setting up database configuration..."
mkdir -p /home/ec2-user/lti-backend/database
cat > /home/ec2-user/lti-backend/database/docker-compose.yml << 'EOF'
version: "3.8"

services:
  postgres:
    image: postgres:13
    container_name: lti-postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:-D1ymf8wyQEGthFR1E9xhCq}
      POSTGRES_USER: ${DB_USER:-LTIdbUser}
      POSTGRES_DB: ${DB_NAME:-LTIdb}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-LTIdbUser}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF

# Create database initialization directory
mkdir -p /home/ec2-user/lti-backend/database/init

# Create environment file for database
cat > /home/ec2-user/lti-backend/database/.env << 'EOF'
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
EOF

# Set proper ownership
chown -R ec2-user:ec2-user /home/ec2-user/lti-backend

# Install Nginx (optional reverse proxy)
echo "📦 Installing Nginx..."
sudo yum install -y nginx

# Install Certbot for SSL certificates
echo "🔒 Installing Certbot for SSL certificates..."
sudo yum install -y python3 python3-pip
sudo pip3 install certbot certbot-nginx

# Create basic Nginx configuration (HTTP first, will be updated to HTTPS)
sudo tee /etc/nginx/conf.d/lti-backend.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3010/health;
        access_log off;
    }
}
EOF

# Create directory for Let's Encrypt challenges
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R nginx:nginx /var/www/html

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "✅ Nginx installed and configured"

# Create SSL setup script
cat > /home/ec2-user/lti-backend/setup-ssl.sh << 'EOF'
#!/bin/bash
set -e

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Usage: ./setup-ssl.sh your-domain.com"
    echo "   Example: ./setup-ssl.sh api.myapp.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$DOMAIN}

echo "🔒 Setting up SSL certificate for domain: $DOMAIN"
echo "📧 Using email: $EMAIL"

# Update Nginx configuration with the actual domain
sudo sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/conf.d/lti-backend.conf

# Reload Nginx to apply domain change
sudo systemctl reload nginx

# Obtain SSL certificate
echo "🔒 Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# Test certificate renewal
echo "🔄 Testing certificate renewal..."
sudo certbot renew --dry-run

echo "✅ SSL certificate successfully installed for $DOMAIN"
echo "🔄 Certificate will auto-renew via cron job"

# Show SSL status
echo "🔍 SSL Certificate status:"
sudo certbot certificates
EOF

chmod +x /home/ec2-user/lti-backend/setup-ssl.sh

# Create SSL renewal check script
cat > /home/ec2-user/lti-backend/check-ssl-renewal.sh << 'EOF'
#!/bin/bash
echo "🔄 Checking SSL certificate renewal..."
sudo certbot renew --quiet
if [ $? -eq 0 ]; then
    echo "✅ SSL certificates are up to date"
    sudo systemctl reload nginx
else
    echo "❌ SSL certificate renewal failed"
    exit 1
fi
EOF

chmod +x /home/ec2-user/lti-backend/check-ssl-renewal.sh

# Install and enable cron service (required for SSL auto-renewal)
echo "🔄 Installing and configuring cron service..."
sudo yum install -y cronie
sudo systemctl enable crond
sudo systemctl start crond

# Set up automatic SSL renewal via cron
echo "🔄 Setting up automatic SSL certificate renewal..."
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /home/ec2-user/lti-backend/check-ssl-renewal.sh >> /var/log/ssl-renewal.log 2>&1") | sudo crontab -

# Create HTTPS-ready Nginx configuration template
cat > /home/ec2-user/lti-backend/nginx-https-template.conf << 'EOF'
# This is a template for HTTPS configuration
# It will be automatically applied when you run setup-ssl.sh

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    # SSL Configuration (will be managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Additional security headers for API
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
    }

    location /health {
        proxy_pass http://localhost:3010/health;
        access_log off;
    }

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

# Create database startup script
cat > /home/ec2-user/lti-backend/start-database.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user/lti-backend/database
docker-compose up -d
echo "🗄️ Database started. Waiting for it to be ready..."
sleep 10
docker-compose exec -T postgres pg_isready -U ${DB_USER:-LTIdbUser}
echo "✅ Database is ready!"
EOF

chmod +x /home/ec2-user/lti-backend/start-database.sh

# Create database stop script
cat > /home/ec2-user/lti-backend/stop-database.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user/lti-backend/database
docker-compose down
echo "🗄️ Database stopped"
EOF

chmod +x /home/ec2-user/lti-backend/stop-database.sh

echo "🎉 EC2 setup completed successfully!"
echo ""
echo "📋 Summary of what was installed:"
echo "  ✅ Node.js 18.x and npm"
echo "  ✅ PM2 process manager (configured for auto-start)"
echo "  ✅ Docker and Docker Compose"
echo "  ✅ PostgreSQL database configuration"
echo "  ✅ Nginx reverse proxy"
echo "  ✅ Certbot for SSL certificates"
echo "  ✅ Automatic SSL renewal (cron job)"
echo "  ✅ Application directory: /home/ec2-user/lti-backend"
echo ""
echo "🔄 Next steps:"
echo "  1. Reboot the instance: sudo reboot"
echo "  2. After reboot, start the database: ./lti-backend/start-database.sh"
echo "  3. Set up SSL certificate: ./lti-backend/setup-ssl.sh your-domain.com"
echo "  4. Configure your GitHub secrets and deploy!"
echo ""
echo "🔧 Database management:"
echo "  • Start database: ./lti-backend/start-database.sh"
echo "  • Stop database: ./lti-backend/stop-database.sh"
echo "  • Database will auto-start with Docker service"
echo ""
echo "🔒 SSL management:"
echo "  • Setup SSL: ./lti-backend/setup-ssl.sh your-domain.com [email]"
echo "  • Check renewal: ./lti-backend/check-ssl-renewal.sh"
echo "  • Certificates auto-renew daily at 12:00 PM"
