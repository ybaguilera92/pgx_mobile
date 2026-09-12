#!/bin/bash

echo "🧹 Limpiando proyecto..."
cd android

# Limpiar cache de Gradle
./gradlew clean

# Limpiar cache de build
rm -rf app/build
rm -rf app/release
rm -rf app/debug

# Limpiar cache de Gradle
rm -rf ~/.gradle/caches/
rm -rf .gradle

echo "📦 Instalando dependencias..."
cd ..
npm install

echo "🔧 Configurando para Android API 35..."
cd android

echo "🏗️ Compilando en modo debug..."
./gradlew assembleDebug

echo "🚀 Compilando en modo release..."
./gradlew assembleRelease

echo "✅ Compilación completada!"
echo "📱 APK Debug: android/app/build/outputs/apk/debug/app-debug.apk"
echo "📱 APK Release: android/app/build/outputs/apk/release/app-release.apk"

cd .. 