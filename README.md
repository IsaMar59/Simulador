# ElectroShip  — Simulador Lógico de Distribución Eléctrica

*Un simulador interactivo profesional de sistemas eléctricos navales con interfaces SCADA*

---

## Inicio Rápido

### Abrir en el Navegador
```bash
# Opción 1: Abre directamente el archivo
index.html          # Landing page / Portada
system.html         # sistema interactivo

# Opción 2: Desde terminal (Windows)
cd "tu-ruta"
Start index.html
```

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Conexión a CDN (Chart.js)

---

## Características Principales

### 📊 Dashboard Avanzado
- **Gráficos en Tiempo Real:** Power charts animados (últimos 30 seg)
- **4 Modos Preconfigurados:** Normal, Emergencia, Peak Load, Eficiencia
- **Sonidos Inteligentes:** Web Audio API con tonos diferentes por evento
- **Exportación CSV:** Descarga registro completo de eventos

###  4 Módulos Educativos

**Módulo 1: Conversor de Unidades**
- kW ↔ HP (× 1.341) | CV (× 1.360)
- P = V × I (en tiempo real)
- Ley de Ohm: V = I × R

**Módulo 2: Potencia del Sistema**
- 4 Generadores de 500 kW c/u
- Cálculo automático de potencia disponible
- Indicador visual de carga (barra con gradiente)
- Alertas de capacidad insuficiente

**Módulo 3: Diagrama del Sistema**
- Flujo visual: Generadores → Distribución → Cargas
- Nodos interactivos con detalles
- Educativo e intuitivo

**Módulo 4: Simulador de Fallos**
- Inyectar fallos de generadores
- Registro automático de eventos
- Detección de consecuencias
- Sistema de recuperación

---

##  Diseño Profesional

### Tema Naval SCADA
- **Colores:** Deep Blue, Electric Blue, Turquoise, Steel Gray
- **Tipografía:** Poppins + Inter (Google Fonts)
- **Responsive:** Mobile-first, adapta a todos los dispositivos
- **Animaciones:** Scroll triggers, transiciones suaves, hover effects

---

## Stack Tecnológico

```
HTML5
├── Semántica
├── ARIA (Accesibilidad)
└── Structure

CSS3
├── Variables (--colors)
├── Grid & Flexbox
├── Keyframes (fadeUp, slideIn, scaleUp)
└── Responsive (900px, 600px breakpoints)

JavaScript ES6
├── Event delegation
├── State management (systemState)
├── DOM manipulation (real-time updates)
└── Web Audio API (síntesis de tonos)

Chart.js 4.4.0
├── Line charts
├── Real-time data
└── Responsive canvas
```

---


##  Casos de Uso

### Educación Técnica
Enseñar conceptos de distribución eléctrica naval con interactividad

### Portfolio Profesional
Demostrar habilidades en frontend (HTML/CSS/JS) + diseño UX/UI

### Demostración de Sistemas
Mostrar cómo funcionan fallos y consecuencias en tiempo real

### Análisis y Monitoreo
Exportar eventos para auditoría o análisis posterior

---

##  Consejos de Uso

1. **Prueba todos los modos:** Cada uno tiene configuración diferente
2. **Inyecta fallos:** Observa cómo cambia la potencia disponible
3. **Revisa el gráfico:** Se actualiza cada 2 segundos
4. **Escucha los sonidos:** Diferentes tonos para diferentes eventos
5. **Exporta datos:** Genera CSV para análisis en Excel

---

## Personalización

### Cambiar Colores
Edita `assets/css/styles.css` y `assets/css/system.css`:
```css
--deep-blue: #0A1A2F;
--electric-blue: #1E90FF;
--turquoise: #1BC7B1;
/* ...más colores */
```

### Agregar Generadores
En `electrical-system.js`, aumenta los valores en:
```javascript
systemState.generators = {1: true, 2: true, 3: false, 4: false};
```

### Ajustar Modos
Modifica `SIMULATION_MODES` en `electrical-system.js`:
```javascript
SIMULATION_MODES.miModo = {
    description: 'Mi descripción',
    generators: [true, false, true, false],
    load: 900,
    icon: '⚡'
}
```

---

##  Troubleshooting

### El gráfico no aparece
- Verifica que Chart.js CDN está cargado (conexión a internet)
- Abre la consola (F12) y busca errores

### Los sonidos no funcionan
- Verifica que el navegador permite audio (sin muteo)
- Haz click en "🔊 Sonidos: ON"
- Algunos navegadores requieren interacción del usuario primero

### Las animaciones van lentas
- Reduce pestañas abiertas
- Usa navegador más moderno
- En móvil, puede ir más lento (normal)

---

##  Información de Contacto

**Desarrollador:** Isaura Ríos  
**Proyecto:** ElectroShip - Simulador Lógico de Distribución Eléctrica  
**Fecha:** Octubre - Noviembre 2025  

---

##  Licencia

Proyecto educativo de demostración. Uso libre con atribución.

---

##  Aprendizajes Incorporados

Este proyecto demuestra competencias en:

- **Frontend Development**
  - HTML semántico
  - CSS avanzado (Grid, Flexbox, Variables, Keyframes)
  - JavaScript vanilla (ES6+)

- **UX/UI Design**
  - Diseño responsivo
  - Paleta de colores coherente
  - Animaciones y transiciones fluidas
  - Accesibilidad (WCAG)

- **Data Visualization**
  - Gráficos interactivos (Chart.js)
  - Monitoreo en tiempo real
  - Exportación de datos (CSV)

- **Ingeniería Eléctrica**
  - Conceptos de distribución
  - Cálculo de potencia
  - Simulación de fallos
  - Análisis de consecuencias

---

**¡Disfruta el simulador!** ⚡
