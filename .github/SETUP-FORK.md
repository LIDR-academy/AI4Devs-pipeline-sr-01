# Setup para Fork - Pipeline DevSecOps

## Configuración de Secrets en Fork

### Opción 1: Secrets Directos (Simple)

1. **Ir a tu fork**: `https://github.com/TU-USUARIO/AI4Devs-pipeline-sr-01`
2. **Settings > Secrets and variables > Actions**
3. **New repository secret** para cada uno:

```bash
# Secrets requeridos
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
EC2_INSTANCE_ID=i-1234567890abcdef0
EC2_HOST=ec2-xx-xx-xx-xx.compute-1.amazonaws.com
S3_BUCKET=tu-bucket-deploy
```

### Opción 2: Environments (Recomendado)

#### 2.1 Crear Environment
1. **Settings > Environments**
2. **New environment** → `production`
3. **Configure environment**:
   - ✅ Required reviewers: (opcional)
   - ✅ Wait timer: 0 minutes
   - ✅ Deployment branches: `All branches`

#### 2.2 Agregar Secrets al Environment
1. **En el environment `production`**
2. **Environment secrets** → **Add secret**:

```bash
# Environment secrets
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
EC2_INSTANCE_ID=i-1234567890abcdef0
EC2_HOST=ec2-xx-xx-xx-xx.compute-1.amazonaws.com
S3_BUCKET=tu-bucket-deploy
```

#### 2.3 Agregar Variables al Environment
1. **Environment variables** → **Add variable**:

```bash
# Environment variables
APP_PORT=3010
```

## Configuración de AWS

### 1. Crear Usuario IAM para GitHub Actions

```bash
# Crear usuario
aws iam create-user --user-name github-actions-pipeline

# Crear access key
aws iam create-access-key --user-name github-actions-pipeline

# Crear política personalizada
aws iam create-policy --policy-name GitHubActionsPipelinePolicy --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::tu-bucket-deploy/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:SendCommand",
        "ssm:GetCommandInvocation",
        "ssm:DescribeInstanceInformation"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}'

# Adjuntar política al usuario
aws iam attach-user-policy --user-name github-actions-pipeline --policy-arn arn:aws:iam::TU-ACCOUNT:policy/GitHubActionsPipelinePolicy
```

### 2. Crear S3 Bucket

```bash
# Crear bucket (debe ser único globalmente)
aws s3 mb s3://tu-bucket-deploy-unico

# Configurar bucket para deployments
aws s3api put-bucket-versioning --bucket tu-bucket-deploy-unico --versioning-configuration Status=Enabled
```

### 3. Configurar EC2

#### 3.1 IAM Role para EC2
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::tu-bucket-deploy-unico/*"
    }
  ]
}
```

#### 3.2 Setup en EC2
```bash
# Conectar a tu EC2
ssh -i tu-key.pem ubuntu@tu-ec2-host

# Instalar dependencias
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs awscli
sudo npm install -g pm2

# Crear directorio de app
sudo mkdir -p /opt/app/releases
sudo chown -R ubuntu:ubuntu /opt/app

# Configurar AWS CLI (si no usa IAM role)
aws configure
```

## Testing del Pipeline

### 1. Crear PR desde tu fork
```bash
# En tu fork local
git checkout -b feature/test-pipeline
echo "# Test Pipeline" >> README.md
git add README.md
git commit -m "test: trigger pipeline"
git push origin feature/test-pipeline

# Crear PR en GitHub desde tu fork
```

### 2. Verificar Ejecución
- **Actions** en tu fork
- Verificar que el pipeline se ejecuta
- Revisar logs de cada job

## Consideraciones Importantes

### 🔒 Seguridad
- **Nunca** compartas tus AWS credentials
- Usa IAM roles cuando sea posible
- Rotar access keys regularmente

### 🚀 Performance
- El pipeline solo se ejecuta si hay PR abierto
- Cache de dependencias acelera builds
- Rollback automático en caso de fallo

### 📊 Monitoreo
- Revisar logs en GitHub Actions
- Verificar estado de la app en EC2
- Monitorear costos de AWS

## Troubleshooting

### Pipeline no se ejecuta
- ✅ Verificar que existe PR abierto
- ✅ Revisar que los secrets están configurados
- ✅ Verificar permisos del usuario IAM

### Error de AWS
- ✅ Verificar credenciales
- ✅ Verificar permisos IAM
- ✅ Verificar que EC2 tiene acceso a S3

### Error de deploy
- ✅ Verificar que SSM está habilitado en EC2
- ✅ Verificar que PM2 está instalado
- ✅ Revisar logs de SSM Command Invocation
