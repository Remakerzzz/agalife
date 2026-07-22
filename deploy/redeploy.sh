#!/usr/bin/env bash
# Запускать на сервере в папке проекта после каждого обновления кода:
#   bash deploy/redeploy.sh
set -euo pipefail

git pull origin claude/agalife-scaffold-afisha-ia8fa3
npm install
npm run build
pm2 restart agalife
