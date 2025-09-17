# Setup del Pipeline DevSecOps

## Checklist de Configuración

### 1. GitHub Secrets (Obligatorios)

Ir a `Settings > Secrets and variables > Actions > Secrets` y agregar:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# AWS Configuration  
AWS_REGION=us-east-1

# EC2 Configuration
EC2_INSTANCE_ID=i-1234567890abcdef0
EC2_HOST=ec2-xx-xx-xx-xx.compute-1.amazonaws.com

# S3 Bucket para artefactos
S3_BUCKET=my-deployment-bucket
```

### 2. GitHub Variables (Opcionales)

Ir a `Settings > Secrets and variables > Actions > Variables` y agregar:

```bash
APP_PORT=3010
```

### 3. AWS S3 Bucket

Crear bucket S3 para almacenar artefactos de deploy:

```bash
# Crear bucket
aws s3 mb s3://my-deployment-bucket

# Configurar política (opcional)
aws s3api put-bucket-policy --bucket my-deployment-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowGitHubActions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:role/GitHubActionsRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-deployment-bucket/*"
    }
  ]
}'
```

### 4. EC2 Instance Setup

#### 4.1 IAM Role para EC2
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-deployment-bucket/*"
    }
  ]
}
```

#### 4.2 Instalar dependencias
```bash
# Conectar a EC2
ssh -i your-key.pem ubuntu@your-ec2-host

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar AWS CLI
sudo apt-get update
sudo apt-get install -y awscli

# Crear directorio de aplicación
sudo mkdir -p /opt/app/releases
sudo chown -R ubuntu:ubuntu /opt/app

# Configurar AWS CLI (si no usa IAM role)
aws configure
```

#### 4.3 Configurar PM2
```bash
# Crear archivo de configuración
sudo tee /opt/app/ecosystem.config.js > /dev/null << 'EOF'
module.exports = {
  apps: [{
    name: 'app',
    script: 'dist/index.js',
    cwd: '/opt/app/current',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3010
    }
  }]
};
EOF

# Hacer ejecutable
sudo chmod +x /opt/app/ecosystem.config.js
```

### 5. Verificar Configuración

#### 5.1 Test local del backend
```bash
cd backend
npm install
npm test
npm run build
```

#### 5.2 Test de conectividad AWS
```bash
# En EC2
aws s3 ls s3://my-deployment-bucket/
```

#### 5.3 Test de SSM
```bash
# Desde tu máquina local
aws ssm send-command \
  --instance-ids i-1234567890abcdef0 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["echo Hello from EC2"]'
```

## Testing del Pipeline

### 1. Crear Pull Request
```bash
# Crear rama de feature
git checkout -b feature/test-pipeline

# Hacer un cambio pequeño
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger pipeline"
git push origin feature/test-pipeline

# Crear PR en GitHub
```

### 2. Verificar Ejecución
- Ir a `Actions` en GitHub
- Verificar que el pipeline se ejecuta
- Revisar logs de cada job
- Verificar que la aplicación se despliega correctamente

### 3. Test de Rollback
```bash
# En EC2, simular fallo
sudo pm2 stop app

# El health check debería fallar y hacer rollback automático
```

## Troubleshooting Común

### Pipeline no se ejecuta
- ✅ Verificar que existe PR abierto
- ✅ Revisar logs del job `detect_pr`

### Error de permisos AWS
- ✅ Verificar credenciales en GitHub Secrets
- ✅ Verificar que el usuario tiene permisos S3 y SSM

### Error de conectividad EC2
- ✅ Verificar que EC2 tiene IAM role correcto
- ✅ Verificar que SSM está habilitado en EC2
- ✅ Verificar security groups

### Error de deploy
- ✅ Verificar que PM2 está instalado
- ✅ Verificar que el directorio `/opt/app` existe
- ✅ Revisar logs de SSM Command Invocation

## Comandos Útiles

### Verificar estado de la aplicación
```bash
# En EC2
pm2 status
pm2 logs app
curl http://localhost:3010/
```

### Rollback manual
```bash
# En EC2
cd /opt/app
sudo rm current
sudo ln -s releases/previous current
pm2 restart app
```

### Limpiar releases antiguas
```bash
# En EC2 (mantener solo las 3 más recientes)
cd /opt/app/releases
ls -t | tail -n +4 | xargs sudo rm -rf
```

## Monitoreo

### GitHub Actions
- Badge de estado: `![Pipeline](https://github.com/USER/REPO/actions/workflows/pipeline.yml/badge.svg)`
- Logs detallados en cada job
- Artefactos disponibles por 7 días

### EC2
- Logs de aplicación: `pm2 logs app`
- Estado del servicio: `pm2 status`
- Uso de recursos: `pm2 monit`
