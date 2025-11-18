/**
 * ElectroShip - Electrical System Simulator
 * Handles unit conversion, power calculations, diagrams, fault simulation, and analytics
 */

// Constants
const GENERATOR_POWER = 500; // kW
const LOAD_CONSTANT = 850; // kW (fixed load)
const VOLTAGE_STANDARD = 440; // Volts

// Simulation Modes
const SIMULATION_MODES = {
    normal: {
        description: 'Sistema operando en modo normal con carga estable.',
        generators: [true, true, false, false],
        load: 850,
        icon: '⚡'
    },
    emergencia: {
        description: 'Modo emergencia: máxima potencia disponible, todos los generadores activos.',
        generators: [true, true, true, true],
        load: 800,
        icon: '🚨'
    },
    peak: {
        description: 'Peak load: alto consumo, generadores al máximo esfuerzo (1800+ kW).',
        generators: [true, true, true, true],
        load: 1800,
        icon: '📈'
    },
    eficiencia: {
        description: 'Modo eficiencia: operación óptima con mínimo consumo (solo 2 generadores).',
        generators: [true, true, false, false],
        load: 600,
        icon: '♻️'
    }
};

// State
let systemState = {
    generators: {
        1: true,
        2: true,
        3: false,
        4: false
    },
    faultedGenerators: [],
    totalAvailable: 1000,
    currentLoad: 850,
    soundEnabled: true,
    currentMode: 'normal',
    powerHistory: [],
    timeHistory: []
};

let powerChart = null;
let chartUpdateInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initConverter();
    initPowerSystem();
    initDiagram();
    initFaultSimulator();
    initSimulationModes();
    initSoundToggle();
    initExportLogs();
    initChart();
    startChartUpdates();
    initHelpModal();
});

// ============================================================================
// MODULE 1: UNIT CONVERTER
// ============================================================================
function initConverter() {
    const kwInput = document.getElementById('kw-input');
    const voltageInput = document.getElementById('voltage-input');
    const currentInput = document.getElementById('current-input');
    const ohmCurrent = document.getElementById('ohm-current');
    const ohmResistance = document.getElementById('ohm-resistance');

    // Power conversions
    kwInput?.addEventListener('input', (e) => {
        const kw = parseFloat(e.target.value) || 0;
        const hp = kw * 1.341;
        const cv = kw * 1.360;
        
        document.getElementById('hp-output').textContent = hp.toFixed(2);
        document.getElementById('cv-output').textContent = cv.toFixed(2);
    });

    // P = V × I (convert to kW)
    voltageInput?.addEventListener('input', calculatePower);
    currentInput?.addEventListener('input', calculatePower);

    // Ohm's Law: V = I × R
    ohmCurrent?.addEventListener('input', calculateOhm);
    ohmResistance?.addEventListener('input', calculateOhm);

    // Trigger initial calculations
    calculatePower();
    calculateOhm();
}

function calculatePower() {
    const voltage = parseFloat(document.getElementById('voltage-input').value) || 0;
    const current = parseFloat(document.getElementById('current-input').value) || 0;
    const powerW = voltage * current;
    const powerKW = powerW / 1000;
    
    document.getElementById('power-output').textContent = powerKW.toFixed(2);
}

function calculateOhm() {
    const current = parseFloat(document.getElementById('ohm-current').value) || 0;
    const resistance = parseFloat(document.getElementById('ohm-resistance').value) || 0;
    const voltage = current * resistance;
    
    document.getElementById('ohm-voltage').textContent = voltage.toFixed(2);
}

// ============================================================================
// MODULE 2: POWER SYSTEM
// ============================================================================
function initPowerSystem() {
    const genToggles = document.querySelectorAll('[data-gen-id]');
    
    genToggles.forEach(toggle => {
        const checkbox = toggle.querySelector('input[type="checkbox"]');
        const genId = toggle.dataset.genId;
        const statusLed = toggle.querySelector('.status-led');
        
        checkbox?.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            systemState.generators[genId] = isChecked;
            
            // Update LED
            if (isChecked) {
                statusLed.classList.remove('off');
                statusLed.classList.add('on');
            } else {
                statusLed.classList.remove('on');
                statusLed.classList.add('off');
            }
            
            updatePowerDisplay();
        });
    });
    
    // Initial update
    updatePowerDisplay();
}

function updatePowerDisplay() {
    // Calculate available power
    const activeGens = Object.entries(systemState.generators)
        .filter(([id, active]) => active && !systemState.faultedGenerators.includes(parseInt(id)))
        .length;
    
    const totalAvailable = activeGens * GENERATOR_POWER;
    systemState.totalAvailable = totalAvailable;
    
    // Calculate available capacity
    const availableCapacity = totalAvailable - systemState.currentLoad;
    const loadPercentage = (systemState.currentLoad / totalAvailable) * 100;
    
    // Update DOM
    document.getElementById('available-power').textContent = totalAvailable + ' kW';
    document.getElementById('current-load').textContent = systemState.currentLoad + ' kW';
    document.getElementById('available-capacity').textContent = availableCapacity + ' kW';
    document.getElementById('load-percentage').textContent = loadPercentage.toFixed(1) + '%';
    
    // Update load bar
    const loadFill = document.getElementById('load-fill');
    if (loadFill) {
        loadFill.style.width = Math.min(loadPercentage, 100) + '%';
    }
    
    // Update warning
    const warning = document.getElementById('load-warning');
    if (availableCapacity < 100) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
    
    // Update load bar color
    if (loadPercentage > 85) {
        loadFill.style.background = 'linear-gradient(90deg, var(--warn-yellow), var(--alarm-red))';
    } else if (loadPercentage > 70) {
        loadFill.style.background = 'linear-gradient(90deg, var(--electric-blue), var(--warn-yellow))';
    } else {
        loadFill.style.background = 'linear-gradient(90deg, var(--ok-green), var(--electric-blue))';
    }
}

// ============================================================================
// MODULE 3: DIAGRAM INTERACTIONS
// ============================================================================
function initDiagram() {
    const nodes = document.querySelectorAll('.node');
    
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const info = node.querySelector('.node-info');
            const isVisible = info.style.display !== 'none';
            
            // Hide all other infos
            document.querySelectorAll('.node-info').forEach(el => {
                el.style.display = 'none';
            });
            
            // Toggle current
            if (!isVisible) {
                info.style.display = 'block';
            }
        });
    });
}

// ============================================================================
// MODULE 4: FAULT SIMULATION
// ============================================================================
function initFaultSimulator() {
    const faultButtons = document.querySelectorAll('.btn-fault');
    const resetButton = document.getElementById('reset-fault');
    
    faultButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const faultId = btn.dataset.fault;
            injectFault(faultId);
        });
    });
    
    resetButton?.addEventListener('click', resetSystem);
}

function injectFault(genId) {
    const genNum = parseInt(genId.split('-')[1]);
    
    if (systemState.faultedGenerators.includes(genNum)) {
        return; // Already faulted
    }
    
    systemState.faultedGenerators.push(genNum);
    
    // Disable generator
    const checkbox = document.getElementById('gen-' + genNum);
    if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = true;
    }
    
    // Update power display
    updatePowerDisplay();
    
    // Log event
    const timestamp = new Date().toLocaleTimeString('es-ES');
    addEvent(`${timestamp} | ⚠️ Fallo detectado en GEN-${genNum}`, 'event-error');
    
    // Check consequences
    checkSystemConsequences();
}

function checkSystemConsequences() {
    const events = [];
    const totalAvailable = systemState.totalAvailable;
    const currentLoad = systemState.currentLoad;
    
    // Check if load exceeds available power
    if (currentLoad > totalAvailable) {
        const deficit = currentLoad - totalAvailable;
        events.push(`⚠️ Déficit de energía: ${deficit.toFixed(0)} kW`);
        
        // Some loads may need to be shed
        if (systemState.faultedGenerators.length >= 2) {
            events.push(`🚨 CRÍTICO: Múltiples generadores fuera de servicio.`);
            addAlert('CRÍTICO: Insuficiencia de energía. Sistemas no esenciales desactivados.', true);
            playSound('critical');
        }
    }
    
    // Specific alerts
    if (systemState.faultedGenerators.includes(1) || systemState.faultedGenerators.includes(2)) {
        if (systemState.faultedGenerators.length >= 2) {
            events.push(`🚨 FALLO MÚLTIPLE: Apenas ${systemState.totalAvailable} kW disponibles.`);
        }
    }
    
    events.forEach(event => {
        if (event.includes('CRÍTICO')) {
            addEvent(event, 'event-error');
        } else if (event.includes('Déficit')) {
            addEvent(event, 'event-warn');
        }
    });
}

function resetSystem() {
    // Clear faulted generators
    systemState.faultedGenerators = [];
    
    // Re-enable checkboxes
    for (let i = 1; i <= 4; i++) {
        const checkbox = document.getElementById('gen-' + i);
        if (checkbox) {
            checkbox.disabled = false;
        }
    }
    
    // Clear events and alerts
    const eventsList = document.getElementById('fault-events');
    eventsList.innerHTML = '<p class="event-info">✓ Sistema operativo. Aguardando eventos...</p>';
    
    const alertsDiv = document.getElementById('fault-alerts');
    alertsDiv.innerHTML = '';
    
    // Reset state
    systemState.faultedGenerators = [];
    updatePowerDisplay();
    
    const timestamp = new Date().toLocaleTimeString('es-ES');
    addEvent(`${timestamp} | ✓ Sistema restaurado`, 'event-info');
}

function addEvent(message, className = 'event-info') {
    const eventsList = document.getElementById('fault-events');
    
    // Remove placeholder if exists
    const placeholder = eventsList.querySelector('.event-info:not([data-real])');
    if (placeholder && placeholder.textContent.includes('Aguardando')) {
        placeholder.remove();
    }
    
    const eventEl = document.createElement('p');
    eventEl.className = className;
    eventEl.setAttribute('data-real', 'true');
    eventEl.textContent = message;
    
    eventsList.insertBefore(eventEl, eventsList.firstChild);
    
    // Keep max 8 events
    const events = eventsList.querySelectorAll('p[data-real]');
    if (events.length > 8) {
        events[events.length - 1].remove();
    }
}

function addAlert(message, isCritical = false) {
    const alertsDiv = document.getElementById('fault-alerts');
    
    const alert = document.createElement('div');
    alert.className = isCritical ? 'alert critical' : 'alert';
    alert.innerHTML = `<strong>${isCritical ? '🚨 ALERTA CRÍTICA' : '⚠️ Advertencia'}:</strong> ${message}`;
    
    alertsDiv.insertBefore(alert, alertsDiv.firstChild);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity .3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 8000);
}

// ============================================================================
// CHARTS & ANALYTICS
// ============================================================================
function initChart() {
    const ctx = document.getElementById('powerChart');
    if (!ctx) return;

    powerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Potencia Disponible (kW)',
                    data: [],
                    borderColor: '#1E90FF',
                    backgroundColor: 'rgba(30,144,255,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#1E90FF',
                    pointBorderColor: '#0A1A2F',
                    pointBorderWidth: 2
                },
                {
                    label: 'Carga Actual (kW)',
                    data: [],
                    borderColor: '#F1C40F',
                    backgroundColor: 'rgba(241,196,15,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#F1C40F',
                    pointBorderColor: '#0A1A2F',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#B5BECF',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(2,8,14,0.8)',
                    titleColor: '#F3F7FD',
                    bodyColor: '#B5BECF',
                    borderColor: '#1E90FF',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2500,
                    ticks: { color: '#B5BECF' },
                    grid: { color: 'rgba(30,144,255,0.1)' }
                },
                x: {
                    ticks: { color: '#B5BECF' },
                    grid: { color: 'rgba(30,144,255,0.1)' }
                }
            }
        }
    });
}

function startChartUpdates() {
    chartUpdateInterval = setInterval(() => {
        const now = new Date().toLocaleTimeString('es-ES');
        
        // Keep only last 30 data points
        if (systemState.powerHistory.length >= 30) {
            systemState.powerHistory.shift();
            systemState.timeHistory.shift();
        }
        
        systemState.powerHistory.push(systemState.totalAvailable);
        systemState.timeHistory.push(now);
        
        if (powerChart) {
            powerChart.data.labels = systemState.timeHistory;
            powerChart.data.datasets[0].data = systemState.powerHistory;
            
            // Carga simulada (con pequeña variación)
            const loadVariation = systemState.currentLoad + (Math.random() - 0.5) * 20;
            powerChart.data.datasets[1].data.push(Math.max(0, loadVariation));
            
            if (powerChart.data.datasets[1].data.length > 30) {
                powerChart.data.datasets[1].data.shift();
            }
            
            powerChart.update('none'); // Sin animación para mejor performance
        }
    }, 2000); // Actualizar cada 2 segundos
}

// ============================================================================
// SIMULATION MODES
// ============================================================================
function initSimulationModes() {
    const modeButtons = document.querySelectorAll('.btn-mode');
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            activateMode(mode);
            
            // Update active state
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function activateMode(modeName) {
    const mode = SIMULATION_MODES[modeName];
    if (!mode) return;
    
    systemState.currentMode = modeName;
    
    // Update generators
    const generators = [1, 2, 3, 4];
    generators.forEach((gen, idx) => {
        const checkbox = document.getElementById('gen-' + gen);
        if (checkbox) {
            checkbox.checked = mode.generators[idx];
            checkbox.disabled = false;
            systemState.generators[gen] = mode.generators[idx];
            
            const statusLed = checkbox.closest('[data-gen-id]')?.querySelector('.status-led');
            if (statusLed) {
                if (mode.generators[idx]) {
                    statusLed.classList.remove('off');
                    statusLed.classList.add('on');
                } else {
                    statusLed.classList.remove('on');
                    statusLed.classList.add('off');
                }
            }
        }
    });
    
    // Update load
    systemState.currentLoad = mode.load;
    
    // Update UI
    const descEl = document.getElementById('mode-description');
    if (descEl) {
        descEl.textContent = mode.description;
    }
    
    // Trigger updates
    updatePowerDisplay();
    playSound('mode');
    
    const timestamp = new Date().toLocaleTimeString('es-ES');
    addEvent(`${timestamp} | ${mode.icon} Modo activado: ${modeName.toUpperCase()}`, 'event-info');
}

// ============================================================================
// SOUND SYSTEM
// ============================================================================
function initSoundToggle() {
    const soundBtn = document.getElementById('sound-toggle');
    if (!soundBtn) return;
    
    soundBtn.addEventListener('click', () => {
        systemState.soundEnabled = !systemState.soundEnabled;
        soundBtn.textContent = `🔊 Sonidos: ${systemState.soundEnabled ? 'ON' : 'OFF'}`;
        soundBtn.classList.toggle('active');
        playSound('success');
    });
}

function playSound(type) {
    if (!systemState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Diferentes tonos para diferentes eventos
        const tones = {
            mode: { freq: 523, duration: 0.3 },      // Do
            warning: { freq: 659, duration: 0.4 },   // Mi
            critical: { freq: 330, duration: 0.6 },  // Mi baja
            success: { freq: 784, duration: 0.25 }   // Sol
        };
        
        const tone = tones[type] || tones.mode;
        oscillator.frequency.value = tone.freq;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + tone.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + tone.duration);
    } catch (e) {
        // Audio not available (e.g., unsupported browser)
    }
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================
function initExportLogs() {
    const exportBtn = document.getElementById('export-logs');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', exportEventLogs);
}

function exportEventLogs() {
    const eventsList = document.getElementById('fault-events');
    const events = eventsList.querySelectorAll('p[data-real]');
    
    let csv = 'Timestamp,Tipo,Mensaje\n';
    
    events.forEach(event => {
        const text = event.textContent;
        const type = event.className.replace('event-', '').toUpperCase();
        csv += `"${text}","${type}","Evento del simulador"\n`;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `electro-ship-logs-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    playSound('success');
}

/**
 * Inicializa el sistema de modal de ayuda interactivo
 */
function initHelpModal() {
    const modal = document.getElementById('help-modal');
    const trigger = document.getElementById('help-trigger');
    const closeBtn = document.getElementById('modal-close');
    const closeBtnFooter = document.getElementById('modal-close-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    if (!modal || !trigger) return;
    
    // Abrir modal al hacer clic en el botón de ayuda
    trigger.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    // Función para cerrar el modal
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    
    // Cerrar al hacer clic en botones de cierre
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Cambiar entre pestañas
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remover clase activa de todos los botones y pestañas
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Agregar clase activa al botón clickeado y su pestaña
            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${tabName}`);
            if (targetPane) {
                targetPane.classList.add('active');
                // Scroll al top de la pestaña
                targetPane.parentElement.parentElement.scrollTop = 0;
            }
        });
    });
    
    // Cerrar modal al presionar tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}
