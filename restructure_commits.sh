#!/bin/bash

# Script pour restructurer les commits avec des messages semantic release
cd /Users/ben/workspace/chalet_vibe_coding

echo "🔄 Restructuration des commits avec semantic release standards..."

# Créer une branche de sauvegarde
git branch backup-original-commits

# Commencer le rebase interactif depuis le premier commit
git rebase -i --root

echo "✅ Préparation terminée. Le rebase interactif va s'ouvrir."
echo "📝 Remplacez 'pick' par 'reword' pour chaque commit à modifier."
