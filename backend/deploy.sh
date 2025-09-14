#!/bin/bash

# Script de despliegue para el backend
# Este script se ejecuta en el servidor EC2

echo "🚀 Iniciando despliegue del backend..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del backend."
    exit 1
fi

# Instalar dependencias de producción
echo "📦 Instalando dependencias de producción..."
npm ci --only=production

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones de base de datos
echo "🗄️ Ejecutando migraciones de base de datos..."
npx prisma db push

# Reiniciar o iniciar la aplicación con PM2
echo "🔄 Gestionando proceso con PM2..."
if pm2 list | grep -q "backend"; then
    echo "🔄 Reiniciando aplicación existente..."
    pm2 restart backend
else
    echo "🆕 Iniciando nueva aplicación..."
    pm2 start ecosystem.config.js --env production
fi

# Verificar el estado
echo "✅ Verificando estado de la aplicación..."
pm2 status

echo "🎉 Despliegue completado!"
