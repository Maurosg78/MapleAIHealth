#!/bin/bash

# Corregir interfaces no exportadas
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "interface [A-Za-z]\+Props" | while read file; do
  sed -i '' -E 's/interface ([A-Za-z]+Props)/export interface \1/g' "$file"
done

# Corregir declaraciones de función/clase no exportadas en archivos de servicio
find src/services -name "*.ts" | xargs grep -l "class [A-Za-z]\+" | while read file; do
  sed -i '' -E 's/class ([A-Za-z]+)/export class \1/g' "$file"
done

find src/services -name "*.ts" | xargs grep -l "function [A-Za-z]\+" | while read file; do
  sed -i '' -E 's/function ([A-Za-z]+)/export function \1/g' "$file"
done
