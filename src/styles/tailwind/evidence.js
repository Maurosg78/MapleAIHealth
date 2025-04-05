// Configuración de Tailwind CSS para componentes de evidencia
// Extiende Tailwind con clases personalizadas basadas en los estilos existentes

module.exports = {
  theme: {
    extend: {
      colors: {
        evidence: {
          // Niveles de evidencia
          'level-a': {
            bg: '#2ecc71',
            border: '#27ae60',
            text: '#ffffff'
          },
          'level-b': {
            bg: '#3498db',
            border: '#2980b9',
            text: '#ffffff'
          },
          'level-c': {
            bg: '#f39c12',
            border: '#e67e22',
            text: '#ffffff'
          },
          'level-d': {
            bg: '#e74c3c',
            border: '#c0392b',
            text: '#ffffff'
          },
          // Confiabilidad de fuentes
          'reliability-high': '#2ecc71',
          'reliability-moderate': '#3498db',
          'reliability-low': '#f39c12',
          'reliability-unknown': '#bdc3c7',
          // Prioridades
          'priority-high': {
            bg: '#fee2e2',
            text: '#dc2626'
          },
          'priority-medium': {
            bg: '#fef9c3',
            text: '#ca8a04'
          },
          'priority-low': {
            bg: '#e0f2fe',
            text: '#0284c7'
          }
        }
      },
      boxShadow: {
        'evidence': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'evidence-hover': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'evidence-dark': '0 4px 12px rgba(0, 0, 0, 0.3)'
      },
      borderRadius: {
        'evidence-badge': '1rem'
      }
    }
  },
  // Variantes personalizadas para estados de los componentes
  variants: {
    extend: {
      backgroundColor: ['active', 'dark'],
      textColor: ['active', 'dark'],
      borderColor: ['dark']
    }
  },
  // Clases de utilidad personalizadas
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.evidence-badge-sm': {
          padding: '0.1rem 0.5rem',
          fontSize: '0.7rem'
        },
        '.evidence-badge-md': {
          padding: '0.25rem 0.75rem',
          fontSize: '0.9rem'
        },
        '.evidence-badge-lg': {
          padding: '0.5rem 1rem',
          fontSize: '1.1rem'
        },
        '.evidence-letter': {
          fontSize: '1.1em',
          fontWeight: '700',
          marginRight: '0.3rem'
        },
        '.evidence-label': {
          fontSize: '0.9em',
          fontWeight: '500'
        }
      };
      addUtilities(newUtilities);
    }
  ]
};
