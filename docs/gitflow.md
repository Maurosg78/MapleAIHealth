# Git Flow básico para AiduxCare

## Ramas principales
- `main`: versión estable de producción.
- `develop`: integración de nuevas funcionalidades (opcional si se requiere en el futuro).

## Ramas de trabajo
- `feature/<nombre>`: nuevas funcionalidades.
- `fix/<nombre>`: correcciones de errores.
- `hotfix/<nombre>`: cambios urgentes sobre producción.
- `release/<nombre>`: versiones listas para despliegue.

## Comandos frecuentes

```bash
# Crear una nueva rama para una funcionalidad
git checkout -b feature/nueva-funcionalidad

# Agregar los cambios
git add .

# Hacer commit de los cambios
git commit -m "feat: breve descripción de la funcionalidad"

# Subir la rama al repositorio remoto
git push origin feature/nueva-funcionalidad

---

✅ Esto te permitirá trabajar en equipo en el futuro sin caos en las versiones.

---

# 📢 Tu turno:

- Crea `gitflow.md` dentro de `/docs/`.
- Copia y pega el contenido.
- Guarda el archivo.

👉🏼 **Cuando lo tengas, me avisas y seguimos con el siguiente (`values.md`).** 🚀  

¡Vamos a un ritmo excelente! ¿Listo?
