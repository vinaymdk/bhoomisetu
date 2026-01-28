#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/ai-microservice"
TARGET_DIR="${1:-$ROOT_DIR/../ai.bhoomisetu.microservice}"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source not found: $SOURCE_DIR"
  exit 1
fi

if [ -e "$TARGET_DIR" ]; then
  echo "Target already exists: $TARGET_DIR"
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp -R "$SOURCE_DIR/." "$TARGET_DIR/"

cd "$TARGET_DIR"
git init
git add .
git commit -m "Initial AI microservice"

echo "AI microservice repo created at: $TARGET_DIR"
