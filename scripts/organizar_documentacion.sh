#!/bin/bash

# Script para organizar la documentación del proyecto MapleAI Health
# Este script mueve todos los archivos de documentación relevantes a la carpeta /documentacion
# y elimina los archivos obsoletos

echo "🍁 Iniciando organización de documentación de MapleAI Health..."

# Crear estructura de carpetas en documentacion
mkdir -p documentacion/mvp
mkdir -p documentacion/sprints
mkdir -p documentacion/tech
mkdir -p documentacion/components

# Copiar archivos README principales
cp README.md documentacion/README_original.md
cp MVP_README.md documentacion/mvp/MVP_README_original.md
cp MILESTONES.md documentacion/sprints/MILESTONES_original.md

# Copiar archivos de MVP
cp docs/mvp/Sprint_1_MVP.md documentacion/mvp/Sprint_1_MVP.md
cp docs/mvp/Sprint_2_MVP.md documentacion/mvp/Sprint_2_MVP.md
cp docs/mvp/Sprint_3_MVP.md documentacion/mvp/Sprint_3_MVP.md
cp docs/mvp/MVP_Summary.md documentacion/mvp/MVP_Summary.md
[ -f docs/mvp/Kanban.md ] && cp docs/mvp/Kanban.md documentacion/mvp/Kanban.md

# Copiar archivos de decisiones técnicas
[ -f docs/tech-decisions/cache-optimization.md ] && cp docs/tech-decisions/cache-optimization.md documentacion/tech/cache-optimization.md
[ -f docs/tech-decisions/next-steps-post-cache.md ] && cp docs/tech-decisions/next-steps-post-cache.md documentacion/tech/next-steps-post-cache.md
[ -f docs/tech-decisions/roadmap-sprint3.md ] && cp docs/tech-decisions/roadmap-sprint3.md documentacion/tech/roadmap-sprint3.md

# Copiar archivos de sprint
[ -f tasks/sprint3-completion/asignaciones.md ] && cp tasks/sprint3-completion/asignaciones.md documentacion/sprints/sprint3-asignaciones.md
[ -f tasks/sprint3-completion/requerimientos-sprint9.md ] && cp tasks/sprint3-completion/requerimientos-sprint9.md documentacion/sprints/requerimientos-sprint9.md
[ -f reports/sprint-reviews/sprint3-cache-optimization-review.md ] && cp reports/sprint-reviews/sprint3-cache-optimization-review.md documentacion/sprints/sprint3-review.md

# Copiar README de componentes
[ -f src/components/emr/ai/README.md ] && cp src/components/emr/ai/README.md documentacion/components/ai-assistant.md
[ -f src/components/emr/soap/SoapCoherenceAnalysis.md ] && cp src/components/emr/soap/SoapCoherenceAnalysis.md documentacion/components/soap-analysis.md

# Copiar otros archivos relevantes
[ -f CONTRIBUTING.md ] && cp CONTRIBUTING.md documentacion/CONTRIBUTING.md
[ -f ROADMAP.md ] && cp ROADMAP.md documentacion/ROADMAP.md
[ -f NEXT_STEPS.md ] && cp NEXT_STEPS.md documentacion/NEXT_STEPS.md
[ -f PROGRESS_TRACKER.md ] && cp PROGRESS_TRACKER.md documentacion/PROGRESS_TRACKER.md
[ -f PROJECT_MANAGEMENT.md ] && cp PROJECT_MANAGEMENT.md documentacion/PROJECT_MANAGEMENT.md

echo "✅ Documentación organizada correctamente en la carpeta /documentacion"
echo "📝 El archivo principal es: documentacion/readme_master_data.md" 