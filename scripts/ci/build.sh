#!/bin/bash
set -e

echo "Building backend..."
npm run build

echo "Building web..."
cd web && npm run build

echo "Building mobile..."
cd mobile && flutter build apk
