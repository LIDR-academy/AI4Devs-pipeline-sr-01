#!/bin/bash

# Script de validación y commit para el pipeline CI/CD
# Autor: DevOps Engineer
# Fecha: $(date)

set -e  # Salir si hay algún error

echo "🚀 Iniciando validación del pipeline CI/CD..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
print_status "Verificando directorio de trabajo..."
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d ".github" ]; then
    print_error "No se encontró la estructura del proyecto. Asegúrate de estar en el directorio raíz."
    exit 1
fi
print_success "Directorio de trabajo correcto"

# 2. Verificar que el archivo ci.yml existe
print_status "Verificando archivo ci.yml..."
if [ ! -f ".github/workflows/ci.yml" ]; then
    print_error "No se encontró el archivo .github/workflows/ci.yml"
    exit 1
fi
print_success "Archivo ci.yml encontrado"

# 3. Validar sintaxis YAML
print_status "Validando sintaxis YAML..."
if command -v yamllint &> /dev/null; then
    yamllint -d "{extends: default, rules: {line-length: {max: 120}}}" .github/workflows/ci.yml
    if [ $? -eq 0 ]; then
        print_success "Sintaxis YAML válida"
    else
        print_error "Errores de sintaxis YAML encontrados"
        exit 1
    fi
else
    print_warning "yamllint no está instalado. Instalando..."
    if command -v pip3 &> /dev/null; then
        pip3 install yamllint
        yamllint -d "{extends: default, rules: {line-length: {max: 120}}}" .github/workflows/ci.yml
        print_success "Sintaxis YAML válida"
    else
        print_warning "No se pudo instalar yamllint. Saltando validación YAML..."
    fi
fi

# 4. Verificar que el backend tiene las dependencias necesarias
print_status "Verificando dependencias del backend..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en el directorio backend"
    exit 1
fi

# Verificar que los scripts necesarios existen
if ! grep -q '"test"' package.json; then
    print_error "Script 'test' no encontrado en package.json del backend"
    exit 1
fi

if ! grep -q '"build"' package.json; then
    print_error "Script 'build' no encontrado en package.json del backend"
    exit 1
fi
print_success "Scripts necesarios encontrados en package.json"

cd ..

# 5. Verificar estructura de directorios
print_status "Verificando estructura de directorios..."
if [ ! -d ".github/workflows" ]; then
    print_error "Directorio .github/workflows no existe"
    exit 1
fi
print_success "Estructura de directorios correcta"

# 6. Verificar permisos del archivo
print_status "Verificando permisos del archivo..."
chmod 644 .github/workflows/ci.yml
print_success "Permisos del archivo configurados"

# 7. Mostrar resumen de cambios
print_status "Resumen de cambios a commitear:"
echo "----------------------------------------"
git diff --name-only
echo "----------------------------------------"

# 8. Verificar estado de git
print_status "Verificando estado de git..."
if [ -n "$(git status --porcelain)" ]; then
    print_success "Hay cambios pendientes de commit"
else
    print_warning "No hay cambios pendientes"
    exit 0
fi

# 9. Agregar archivos al staging
print_status "Agregando archivos al staging..."
git add .github/workflows/ci.yml
print_success "Archivos agregados al staging"

# 10. Mostrar preview del commit
print_status "Preview del commit:"
echo "----------------------------------------"
git diff --cached
echo "----------------------------------------"

# 11. Preguntar confirmación
echo ""
print_warning "¿Deseas proceder con el commit? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # 12. Hacer commit
    print_status "Realizando commit..."
    git commit -m "feat: agregar pipeline CI/CD para backend

- Configurar workflow de GitHub Actions
- Ejecutar tests y build en pull requests
- Desplegar automáticamente a EC2
- Usar artefactos para pasar build entre jobs
- Reiniciar servicio backend.service en EC2"
    
    print_success "Commit realizado exitosamente"
    
    # 13. Mostrar información de push
    echo ""
    print_status "Para subir los cambios, ejecuta:"
    echo "git push origin pipeline-AAMM"
    echo ""
    print_warning "Asegúrate de configurar los secrets en GitHub:"
    echo "- AWS_ACCESS_ID"
    echo "- AWS_ACCESS_KEY" 
    echo "- EC2_INSTANCE"
    
else
    print_warning "Commit cancelado por el usuario"
    git reset HEAD .github/workflows/ci.yml
    exit 0
fi

print_success "✅ Validación completada exitosamente"
echo ""
print_warning "📋 Para instancias t2.micro, considera ejecutar:"
echo "./setup-ec2-t2micro.sh <IP_EC2_INSTANCE>"
echo ""
print_warning "🔧 Optimizaciones incluidas para t2.micro:"
echo "- Verificación de espacio en disco"
echo "- Timeout en instalación de dependencias (5 min)"
echo "- Backup automático antes del deploy"
echo "- Límites de memoria y CPU en el servicio"
echo "- Limpieza automática de archivos temporales"
