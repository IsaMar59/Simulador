// Datos de los generadores con características realistas
const generadores = [
    { 
        id: 'gen1', 
        nombre: 'Generador Principal 1', 
        potencia: 1000, 
        potenciaMax: 1200,
        consumoCombustible: 0.2, // litros por kWh
        eficiencia: 0.92, // 92% de eficiencia
        temperatura: 25, // °C
        horasUso: 0,
        mantenimientoCada: 1000, // horas
        activo: false,
        fallo: false,
        ultimoMantenimiento: new Date()
    },
    { 
        id: 'gen2', 
        nombre: 'Generador Principal 2', 
        potencia: 1000, 
        potenciaMax: 1200,
        consumoCombustible: 0.2,
        eficiencia: 0.9,
        temperatura: 25,
        horasUso: 0,
        mantenimientoCada: 1000,
        activo: false,
        fallo: false,
        ultimoMantenimiento: new Date()
    },
    { 
        id: 'gen3', 
        nombre: 'Generador de Emergencia', 
        potencia: 500, 
        potenciaMax: 600,
        consumoCombustible: 0.25,
        eficiencia: 0.88,
        temperatura: 22,
        horasUso: 0,
        mantenimientoCada: 500,
        activo: false,
        fallo: false,
        automatico: true,
        ultimoMantenimiento: new Date()
    },
    { 
        id: 'gen4', 
        nombre: 'Generador Auxiliar', 
        potencia: 300, 
        potenciaMax: 350,
        consumoCombustible: 0.3,
        eficiencia: 0.85,
        temperatura: 20,
        horasUso: 0,
        mantenimientoCada: 300,
        activo: false,
        fallo: false,
        ultimoMantenimiento: new Date()
    }
];

// Datos de las cargas con características realistas
const cargas = [
    { 
        id: 'iluminacion', 
        nombre: 'Sistema de Iluminación', 
        consumo: 50, 
        consumoMax: 150,
        factorPotencia: 0.95,
        activa: false, 
        prioridad: 'media',
        variacion: 0.1, // Variación del 10% en el consumo
        tiempoUso: 0,
        fallo: false
    },
    { 
        id: 'bomba', 
        nombre: 'Bomba de Agua de Mar', 
        consumo: 200, 
        consumoMax: 300,
        factorPotencia: 0.88,
        activa: false, 
        prioridad: 'alta',
        variacion: 0.15,
        tiempoUso: 0,
        fallo: false
    },
    { 
        id: 'radar', 
        nombre: 'Sistema de Navegación', 
        consumo: 80, 
        consumoMax: 120,
        factorPotencia: 0.9,
        activa: false, 
        prioridad: 'alta',
        variacion: 0.05,
        tiempoUso: 0,
        fallo: false
    },
    { 
        id: 'propulsion', 
        nombre: 'Sistema de Propulsión', 
        consumo: 800, 
        consumoMax: 1500,
        factorPotencia: 0.92,
        activa: false, 
        prioridad: 'critica',
        variacion: 0.2,
        tiempoUso: 0,
        fallo: false
    },
    { 
        id: 'climatizacion', 
        nombre: 'Sistema de Climatización', 
        consumo: 150, 
        consumoMax: 300,
        factorPotencia: 0.9,
        activa: false, 
        prioridad: 'media',
        variacion: 0.25,
        tiempoUso: 0,
        fallo: false
    },
    { 
        id: 'comunicaciones', 
        nombre: 'Sistema de Comunicaciones', 
        consumo: 30, 
        consumoMax: 50,
        factorPotencia: 0.95,
        activa: true, 
        prioridad: 'critica',
        variacion: 0.05,
        tiempoUso: 0,
        fallo: false
    }
];

// Sistema de baterías
const baterias = {
    capacidad: 500, // kWh
    cargaActual: 500, // kWh
    voltaje: 24, // V
    estadoCarga: 100, // %
    cargando: false,
    descargando: false,
    eficiencia: 0.95,
    vidaUtil: 5000, // ciclos
    ciclos: 0,
    fallo: false
};

// Sistema de combustible
const combustible = {
    capacidad: 10000, // litros
    nivel: 8000, // litros
    consumoTotal: 0, // litros
    ultimoConsumo: new Date()
};

// Sistema eléctrico
const sistemaElectrico = {
    frecuencia: 60, // Hz
    tension: 440, // V
    factorPotencia: 0.9,
    estabilidad: 1.0, // 0.0 a 1.0
    fallo: false
};

// Variables de simulación
let simulacionActiva = false;
let intervaloSimulacion;
let tiempoSimulacion = 0; // segundos
const VELOCIDAD_SIMULACION = 10; // segundos reales = 1 minuto de simulación

// Estado del sistema
let estadoSistema = {
    potenciaDisponible: 0,
    potenciaRequerida: 0,
    potenciaGenerada: 0,
    potenciaPerdida: 0,
    eficienciaTotal: 0,
    estado: 'critico', // 'critico', 'advertencia', 'estable', 'emergencia'
    falloActivo: false,
    modoOperacion: 'manual', // 'manual', 'semiautomatico', 'automatico'
    alarma: {
        activa: false,
        mensaje: '',
        nivel: 'info' // 'info', 'advertencia', 'critico'
    },
    log: [],
    tiempoOperacion: 0, // minutos
    ultimaActualizacion: new Date()
};

// Inicialización del simulador
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    inicializarGeneradores();
    inicializarCargas();
    
    // Configurar eventos
    document.getElementById('simulateBtn').addEventListener('click', simularFallo);
    document.getElementById('startSimulation').addEventListener('click', toggleSimulacion);
    document.getElementById('resetSystem').addEventListener('click', reiniciarSistema);
    document.getElementById('addLoad').addEventListener('click', mostrarModalCargaPersonalizada);
    
    // Iniciar actualización en tiempo real
    setInterval(actualizarTiempoReal, 1000);
    
    // Actualizar el estado inicial
    actualizarEstadoSistema();
    
    // Iniciar con el sistema de comunicaciones activo
    const comunicaciones = cargas.find(c => c.id === 'comunicaciones');
    if (comunicaciones) {
        comunicaciones.activa = true;
    }
    
    // Registrar evento de inicio
    registrarEvento('Sistema inicializado', 'info');
});

// Función para inicializar las cargas en la interfaz
function inicializarCargas() {
    const container = document.querySelector('.loads-container');
    container.innerHTML = ''; // Limpiar contenedor
    
    cargas.forEach(carga => {
        const cargaElement = document.createElement('div');
        cargaElement.className = `load-item ${carga.activa ? 'active' : ''} ${carga.prioridad}`;
        cargaElement.id = carga.id;
        
        cargaElement.innerHTML = `
            <div class="load-icon">
                <i class="fas ${obtenerIconoCarga(carga.id)}"></i>
            </div>
            <div class="load-info">
                <h3>${carga.nombre}</h3>
                <div class="load-details">
                    <span class="load-power">${carga.consumo} kW</span>
                    <span class="load-priority ${carga.prioridad}">${carga.prioridad.toUpperCase()}</span>
                </div>
                <div class="load-status">
                    <span class="status">Estado: <span>${carga.activa ? 'Activo' : 'Inactivo'}</span></span>
                    <span class="status-dot"></span>
                </div>
                <div class="load-controls">
                    <button class="btn-toggle" data-carga="${carga.id}">
                        <i class="fas fa-power-off"></i> ${carga.activa ? 'Apagar' : 'Encender'}
                    </button>
                    <div class="load-stats">
                        <span class="stat">FP: ${carga.factorPotencia}</span>
                        <span class="stat">Uso: ${carga.tiempoUso}h</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(cargaElement);
    });
    
    // Agregar eventos a los botones de carga
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const cargaId = this.getAttribute('data-carga');
            toggleCarga(cargaId);
        });
    });
}

// Función para obtener el icono correspondiente a cada carga
function obtenerIconoCarga(id) {
    const iconos = {
        'iluminacion': 'fa-lightbulb',
        'bomba': 'fa-tint',
        'radar': 'fa-satellite-dish',
        'propulsion': 'fa-ship',
        'climatizacion': 'fa-snowflake',
        'comunicaciones': 'fa-broadcast-tower'
    };
    return iconos[id] || 'fa-plug';
}

// Función para alternar el estado de una carga
function toggleCarga(cargaId) {
    const carga = cargas.find(c => c.id === cargaId);
    if (!carga) return;
    
    // No permitir apagar cargas críticas manualmente
    if (carga.prioridad === 'critica' && carga.activa) {
        mostrarAlerta('No se puede desactivar un sistema crítico manualmente', 'warning');
        return;
    }
    
    carga.activa = !carga.activa;
    actualizarEstadoSistema();
    
    // Actualizar interfaz
    const cargaElement = document.getElementById(cargaId);
    if (cargaElement) {
        cargaElement.classList.toggle('active');
        const statusText = cargaElement.querySelector('.status span');
        const btnToggle = cargaElement.querySelector('.btn-toggle');
        
        if (statusText) statusText.textContent = carga.activa ? 'Activo' : 'Inactivo';
        if (btnToggle) {
            btnToggle.innerHTML = `<i class="fas fa-power-off"></i> ${carga.activa ? 'Apagar' : 'Encender'}`;
        }
    }
    
    registrarEvento(`Carga ${carga.nombre} ${carga.activa ? 'activada' : 'desactivada'}`, 'info');
}

// Función para actualizar el sistema en tiempo real
function actualizarTiempoReal() {
    if (!simulacionActiva) return;
    
    // Actualizar tiempo de simulación
    tiempoSimulacion++;
    const minutos = Math.floor(tiempoSimulacion / 60);
    const segundos = tiempoSimulacion % 60;
    document.getElementById('tiempoSimulacion').textContent = 
        `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    // Actualizar generadores
    actualizarGeneradores();
    
    // Actualizar cargas
    actualizarCargas();
    
    // Actualizar baterías
    actualizarBaterias();
    
    // Actualizar combustible
    actualizarCombustible();
    
    // Verificar fallos
    verificarFallos();
    
    // Actualizar interfaz
    actualizarEstadoSistema();
}

// Función para actualizar el estado de los generadores
function actualizarGeneradores() {
    generadores.forEach(generador => {
        if (generador.activo && !generador.fallo) {
            // Aumentar horas de uso
            generador.horasUso += (1/60); // 1 minuto de simulación
            
            // Aumentar temperatura (dependiendo de la carga)
            const factorCarga = estadoSistema.potenciaGenerada / 
                generadores.filter(g => g.activo).reduce((sum, g) => sum + g.potencia, 0);
            generador.temperatura += (factorCarga * 0.05);
            
            // Enfriamiento natural
            generador.temperatura = Math.max(20, generador.temperatura - 0.01);
            
            // Consumir combustible
            const consumoActual = (generador.potencia * 1/60) * generador.consumoCombustible;
            combustible.nivel = Math.max(0, combustible.nivel - consumoActual);
            combustible.consumoTotal += consumoActual;
            
            // Verificar sobrecalentamiento
            if (generador.temperatura > 100) {
                const probabilidadFallo = (generador.temperatura - 100) * 0.01;
                if (Math.random() < probabilidadFallo) {
                    generarFalloGenerador(generador.id, 'Sobrecarga térmica');
                }
            }
            
            // Verificar mantenimiento
            if (generador.horasUso >= generador.mantenimientoCada) {
                const probabilidadFallo = (generador.horasUso - generador.mantenimientoCada) * 0.001;
                if (Math.random() < probabilidadFallo) {
                    generarFalloGenerador(generador.id, 'Mantenimiento requerido');
                }
            }
        }
    });
}

// Función para actualizar el estado de las cargas
function actualizarCargas() {
    cargas.forEach(carga => {
        if (carga.activa) {
            // Aumentar tiempo de uso
            carga.tiempoUso += (1/60); // 1 minuto de simulación
            
            // Variación de consumo
            if (Math.random() < 0.1) { // 10% de probabilidad de cambio
                const variacion = (Math.random() * 2 - 1) * carga.variacion * carga.consumo;
                carga.consumoActual = Math.max(10, Math.min(carga.consumoMax, carga.consumo + variacion));
            }
            
            // Verificar fallos en cargas
            if (Math.random() < 0.0001) { // Baja probabilidad de fallo
                generarFalloCarga(carga.id, 'Fallo eléctrico');
            }
        }
    });
}

// Función para actualizar el estado de las baterías
function actualizarBaterias() {
    const potenciaExcedente = estadoSistema.potenciaGenerada - estadoSistema.potenciaRequerida;
    
    if (potenciaExcedente > 0 && baterias.estadoCarga < 100) {
        // Cargar baterías
        const potenciaCarga = Math.min(potenciaExcedente, 50); // Máximo 50kW de carga
        const energiaCarga = (potenciaCarga * (1/60)) / 60; // kWh por minuto
        
        baterias.cargaActual = Math.min(
            baterias.capacidad, 
            baterias.cargaActual + (energiaCarga * baterias.eficiencia)
        );
        baterias.estadoCarga = (baterias.cargaActual / baterias.capacidad) * 100;
        baterias.cargando = true;
        baterias.descargando = false;
    } else if (potenciaExcedente < 0 && baterias.estadoCarga > 0) {
        // Descargar baterías
        const potenciaDescarga = Math.min(-potenciaExcedente, 100); // Máximo 100kW de descarga
        const energiaDescarga = (potenciaDescarga * (1/60)) / 60; // kWh por minuto
        
        baterias.cargaActual = Math.max(0, baterias.cargaActual - energiaDescarga);
        baterias.estadoCarga = (baterias.cargaActual / baterias.capacidad) * 100;
        baterias.descargando = true;
        baterias.cargando = false;
        
        if (baterias.estadoCarga < 20) {
            registrarEvento('Batería baja', 'advertencia');
        }
        
        // Contar ciclos de carga/descarga
        if (baterias.descargando && !baterias.estadoAnteriorDescarga) {
            baterias.ciclos += 0.1; // Fracción de ciclo
        }
    } else {
        baterias.cargando = false;
        baterias.descargando = false;
    }
    
    baterias.estadoAnteriorDescarga = baterias.descargando;
    
    // Actualizar interfaz de baterías
    actualizarInterfazBaterias();
}

// Función para actualizar el estado del combustible
function actualizarCombustible() {
    // Actualizar cada minuto
    if (tiempoSimulacion % 60 === 0) {
        const ahora = new Date();
        const tiempoTranscurrido = (ahora - combustible.ultimoConsumo) / (1000 * 60); // minutos
        
        if (tiempoTranscurrido >= 1) {
            // Consumo de combustible por los generadores activos
            const consumoTotal = generadores
                .filter(g => g.activo && !g.fallo)
                .reduce((total, g) => {
                    return total + (g.potencia * g.consumoCombustible * (tiempoTranscurrido / 60));
                }, 0);
            
            combustible.nivel = Math.max(0, combustible.nivel - consumoTotal);
            combustible.consumoTotal += consumoTotal;
            combustible.ultimoConsumo = ahora;
            
            // Verificar nivel de combustible
            if (combustible.nivel <= combustible.capacidad * 0.1) {
                registrarEvento('Nivel de combustible crítico', 'critico');
            } else if (combustible.nivel <= combustible.capacidad * 0.3) {
                registrarEvento('Nivel de combustible bajo', 'advertencia');
            }
            
            // Actualizar interfaz
            actualizarInterfazCombustible();
        }
    }
}

// Función para verificar fallos en el sistema
function verificarFallos() {
    // Verificar fallos aleatorios en generadores
    if (Math.random() < 0.0005) { // Muy baja probabilidad de fallo
        const generadoresActivos = generadores.filter(g => g.activo && !g.fallo);
        if (generadoresActivos.length > 0) {
            const idx = Math.floor(Math.random() * generadoresActivos.length);
            generarFalloGenerador(generadoresActivos[idx].id, 'Fallo aleatorio');
        }
    }
    
    // Verificar si se quedó sin combustible
    if (combustible.nivel <= 0 && !estadoSistema.falloActivo) {
        estadoSistema.falloActivo = true;
        registrarEvento('¡Sin combustible! Los generadores se apagarán', 'critico');
        
        // Apagar generadores por falta de combustible
        generadores.forEach(g => {
            if (g.activo) {
                g.activo = false;
                registrarEvento(`${g.nombre} apagado por falta de combustible`, 'critico');
            }
        });
    }
}

// Función para generar un fallo en un generador
function generarFalloGenerador(generadorId, motivo) {
    const generador = generadores.find(g => g.id === generadorId);
    if (!generador || generador.fallo) return;
    
    generador.fallo = true;
    generador.activo = false;
    
    // Actualizar interfaz
    const generadorElement = document.getElementById(generadorId);
    if (generadorElement) {
        generadorElement.classList.add('fallo');
        generadorElement.classList.remove('active');
        
        const statusText = generadorElement.querySelector('.status-text');
        if (statusText) statusText.textContent = 'Fallo';
        
        const switchInput = generadorElement.querySelector('input[type="checkbox"]');
        if (switchInput) switchInput.checked = false;
    }
    
    registrarEvento(`FALLO en ${generador.nombre}: ${motivo}`, 'critico');
    
    // Si está en modo automático, intentar encender otro generador
    if (estadoSistema.modoOperacion === 'automatico') {
        const generadorDisponible = generadores.find(g => !g.activo && !g.fallo);
        if (generadorDisponible) {
            generadorDisponible.activo = true;
            registrarEvento(`${generadorDisponible.nombre} activado automáticamente`, 'info');
        }
    }
    
    actualizarEstadoSistema();
}

// Función para generar un fallo en una carga
function generarFalloCarga(cargaId, motivo) {
    const carga = cargas.find(c => c.id === cargaId);
    if (!carga || !carga.activa || carga.fallo) return;
    
    carga.fallo = true;
    carga.activa = false;
    
    // Actualizar interfaz
    const cargaElement = document.getElementById(cargaId);
    if (cargaElement) {
        cargaElement.classList.add('fallo');
        cargaElement.classList.remove('active');
        
        const statusText = cargaElement.querySelector('.status span');
        if (statusText) statusText.textContent = 'Fallo';
        
        const btnToggle = cargaElement.querySelector('.btn-toggle');
        if (btnToggle) {
            btnToggle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fallo';
            btnToggle.disabled = true;
        }
    }
    
    registrarEvento(`FALLO en ${carga.nombre}: ${motivo}`, 'advertencia');
    actualizarEstadoSistema();
}

// Función para reparar un componente
function repararComponente(tipo, id) {
    if (tipo === 'generador') {
        const generador = generadores.find(g => g.id === id);
        if (generador && generador.fallo) {
            generador.fallo = false;
            generador.temperatura = 30;
            generador.ultimoMantenimiento = new Date();
            
            // Actualizar interfaz
            const generadorElement = document.getElementById(id);
            if (generadorElement) {
                generadorElement.classList.remove('fallo');
                
                const statusText = generadorElement.querySelector('.status-text');
                if (statusText) statusText.textContent = 'Reparado';
                
                // Si estaba en modo automático, reactivarlo
                if (estadoSistema.modoOperacion === 'automatico') {
                    generador.activo = true;
                    generadorElement.classList.add('active');
                    const switchInput = generadorElement.querySelector('input[type="checkbox"]');
                    if (switchInput) switchInput.checked = true;
                }
            }
            
            registrarEvento(`${generador.nombre} reparado`, 'info');
            actualizarEstadoSistema();
            return true;
        }
    } else if (tipo === 'carga') {
        const carga = cargas.find(c => c.id === id);
        if (carga && carga.fallo) {
            carga.fallo = false;
            
            // Actualizar interfaz
            const cargaElement = document.getElementById(id);
            if (cargaElement) {
                cargaElement.classList.remove('fallo');
                
                const statusText = cargaElement.querySelector('.status span');
                if (statusText) statusText.textContent = 'Reparado';
                
                const btnToggle = cargaElement.querySelector('.btn-toggle');
                if (btnToggle) {
                    btnToggle.innerHTML = '<i class="fas fa-power-off"></i> Encender';
                    btnToggle.disabled = false;
                }
            }
            
            registrarEvento(`${carga.nombre} reparado`, 'info');
            actualizarEstadoSistema();
            return true;
        }
    }
    
    return false;
}

// Función para registrar eventos en el log
function registrarEvento(mensaje, nivel = 'info') {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString();
    
    estadoSistema.log.unshift({
        timestamp: ahora,
        mensaje: mensaje,
        nivel: nivel
    });
    
    // Limitar el tamaño del log
    if (estadoSistema.log.length > 100) {
        estadoSistema.log.pop();
    }
    
    // Actualizar interfaz si está visible
    actualizarLogEventos();
    
    // Mostrar notificación si es necesario
    if (nivel === 'critico' || nivel === 'advertencia') {
        mostrarAlerta(mensaje, nivel);
    }
}

// Función para actualizar el log de eventos en la interfaz
function actualizarLogEventos() {
    const logContainer = document.getElementById('eventLog');
    if (!logContainer) return;
    
    logContainer.innerHTML = '';
    
    estadoSistema.log.slice(0, 10).forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.className = `log-entry ${evento.nivel}`;
        
        const icono = {
            'info': 'info-circle',
            'advertencia': 'exclamation-triangle',
            'critico': 'exclamation-circle'
        }[evento.nivel] || 'info-circle';
        
        eventoElement.innerHTML = `
            <span class="log-time">${evento.timestamp.toLocaleTimeString()}</span>
            <i class="fas fa-${icono}"></i>
            <span class="log-message">${evento.mensaje}</span>
        `;
        
        logContainer.appendChild(eventoElement);
    });
}

// Función para actualizar la interfaz de baterías
function actualizarInterfazBaterias() {
    const bateriaElement = document.getElementById('bateriaStatus');
    if (!bateriaElement) return;
    
    const nivelElement = bateriaElement.querySelector('.battery-level');
    const porcentajeElement = bateriaElement.querySelector('.battery-percentage');
    const estadoElement = bateriaElement.querySelector('.battery-status');
    
    if (nivelElement) {
        nivelElement.style.width = `${baterias.estadoCarga}%`;
        nivelElement.className = `battery-level ${baterias.estadoCarga > 70 ? 'high' : 
            baterias.estadoCarga > 30 ? 'medium' : 'low'}`;
    }
    
    if (porcentajeElement) {
        porcentajeElement.textContent = `${Math.round(baterias.estadoCarga)}%`;
    }
    
    if (estadoElement) {
        let estado = '';
        if (baterias.cargando) estado = 'Cargando...';
        else if (baterias.descargando) estado = 'Descargando...';
        else estado = 'En espera';
        
        estadoElement.textContent = estado;
    }
}

// Función para actualizar la interfaz de combustible
function actualizarInterfazCombustible() {
    const combustibleElement = document.getElementById('combustibleStatus');
    if (!combustibleElement) return;
    
    const nivelElement = combustibleElement.querySelector('.fuel-level');
    const porcentajeElement = combustibleElement.querySelector('.fuel-percentage');
    const litrosElement = combustibleElement.querySelector('.fuel-liters');
    
    const porcentaje = (combustible.nivel / combustible.capacidad) * 100;
    
    if (nivelElement) {
        nivelElement.style.height = `${porcentaje}%`;
        nivelElement.className = `fuel-level ${porcentaje > 30 ? 'high' : 'low'}`;
    }
    
    if (porcentajeElement) {
        porcentajeElement.textContent = `${Math.round(porcentaje)}%`;
    }
    
    if (litrosElement) {
        litrosElement.textContent = `${Math.round(combustible.nivel)} / ${combustible.capacidad} L`;
    }
}

// Función para inicializar los generadores en la interfaz
function inicializarGeneradores() {
    const container = document.getElementById('generatorsList');
    container.innerHTML = ''; // Limpiar contenedor
    
    generadores.forEach(generador => {
        const generadorElement = document.createElement('div');
        generadorElement.className = `generator-item ${generador.activo ? 'active' : ''}`;
        generadorElement.id = generador.id;
        
        generadorElement.innerHTML = `
            <div class="generator-header">
                <div class="generator-name">${generador.nombre}</div>
                <div class="generator-power">${generador.potencia} kW</div>
            </div>
            <div class="generator-status">
                <span>${generador.activo ? 'Encendido' : 'Apagado'}</span>
                <label class="switch">
                    <input type="checkbox" ${generador.activo ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
        
        // Agregar evento de cambio al switch
        const switchInput = generadorElement.querySelector('input[type="checkbox"]');
        switchInput.addEventListener('change', () => {
            generador.activo = switchInput.checked;
            generadorElement.classList.toggle('active', generador.activo);
            actualizarEstadoSistema();
        });
        
        container.appendChild(generadorElement);
    });
}

// Función para convertir kW a HP y CV
function convertirPotencia() {
    const kwInput = parseFloat(document.getElementById('kwInput').value);
    
    if (isNaN(kwInput) || kwInput < 0) {
        mostrarAlerta('Por favor ingrese un valor válido en kW', 'warning');
        return;
    }
    
    // Conversiones
    const hp = kwInput * 1.34102;  // 1 kW = 1.34102 HP
    const cv = kwInput * 1.35962;  // 1 kW = 1.35962 CV
    
    // Actualizar la interfaz
    document.getElementById('hpResult').textContent = hp.toFixed(2);
    document.getElementById('cvResult').textContent = cv.toFixed(2);
    
    // Mostrar notificación
    mostrarAlerta(`Conversión completada: ${kwInput} kW = ${hp.toFixed(2)} HP = ${cv.toFixed(2)} CV`, 'success');
}

// Función para actualizar el estado del sistema
function actualizarEstadoSistema() {
    // Calcular potencia total generada
    const potenciaGenerada = generadores
        .filter(gen => gen.activo && !gen.fallo)
        .reduce((total, gen) => total + gen.potencia, 0);
    
    // Calcular potencia requerida por cargas activas
    const cargasActivas = cargas.filter(carga => carga.activa && !carga.fallo);
    const potenciaRequerida = cargasActivas.reduce((total, carga) => {
        return total + (carga.consumoActual || carga.consumo);
    }, 0);
    
    // Calcular eficiencia del sistema
    const perdidas = generadores
        .filter(gen => gen.activo && !gen.fallo)
        .reduce((total, gen) => total + (gen.potencia * (1 - gen.eficiencia)), 0);
    
    const eficienciaTotal = potenciaGenerada > 0 
        ? Math.max(0, Math.min(100, ((potenciaGenerada - perdidas) / potenciaGenerada) * 100))
        : 0;
    
    // Actualizar estado del sistema
    estadoSistema.potenciaGenerada = potenciaGenerada;
    estadoSistema.potenciaRequerida = potenciaRequerida;
    estadoSistema.potenciaPerdida = perdidas;
    estadoSistema.eficienciaTotal = eficienciaTotal;
    estadoSistema.ultimaActualizacion = new Date();
    
    // Determinar el estado del sistema
    if (potenciaGenerada === 0 && potenciaRequerida > 0) {
        estadoSistema.estado = 'emergencia';
        if (!estadoSistema.alarma.activa) {
            estadoSistema.alarma = {
                activa: true,
                mensaje: '¡Sistema en emergencia! Sin generación de energía',
                nivel: 'critico'
            };
        }
    } else if (potenciaGenerada >= potenciaRequerida * 1.2) {
        estadoSistema.estado = 'sobrecargado';
    } else if (potenciaGenerada >= potenciaRequerida) {
        estadoSistema.estado = 'estable';
    } else if (potenciaGenerada >= potenciaRequerida * 0.7) {
        estadoSistema.estado = 'advertencia';
    } else {
        estadoSistema.estado = 'critico';
    }
    
    // Gestionar baterías si es necesario
    if (estadoSistema.estado === 'critico' || estadoSistema.estado === 'emergencia') {
        const potenciaFaltante = potenciaRequerida - potenciaGenerada;
        const potenciaBateria = Math.min(potenciaFaltante, 100); // Máximo 100kW de las baterías
        
        if (baterias.estadoCarga > 10) {
            estadoSistema.potenciaDisponible = potenciaGenerada + potenciaBateria;
            registrarEvento('Sistema utilizando energía de respaldo de baterías', 'advertencia');
        } else {
            // Si las baterías están bajas, forzar apagado de cargas no críticas
            estadoSistema.potenciaDisponible = potenciaGenerada;
            if (estadoSistema.estado !== 'emergencia') {
                apagarCargasNoCriticas();
            }
        }
    } else {
        estadoSistema.potenciaDisponible = potenciaGenerada;
    }
    
    // Actualizar la interfaz
    actualizarInterfaz();
    
    // Actualizar estados de las cargas
    actualizarEstadosCargas();
    
    // Actualizar paneles de información
    actualizarPanelesInformacion();
}

// Función para apagar cargas no críticas
function apagarCargasNoCriticas() {
    let potenciaNecesaria = estadoSistema.potenciaRequerida - estadoSistema.potenciaDisponible;
    
    // Ordenar cargas por prioridad (de menor a mayor) y consumo (de mayor a menor)
    const cargasParaApagar = [...cargas]
        .filter(carga => 
            carga.activa && 
            !carga.fallo && 
            carga.prioridad !== 'critica'
        )
        .sort((a, b) => {
            const prioridades = { 'baja': 1, 'media': 2, 'alta': 3, 'critica': 4 };
            if (prioridades[a.prioridad] !== prioridades[b.prioridad]) {
                return prioridades[a.prioridad] - prioridades[b.prioridad];
            }
            return b.consumo - a.consumo;
        });
    
    // Apagar cargas hasta tener suficiente potencia
    for (const carga of cargasParaApagar) {
        if (potenciaNecesaria <= 0) break;
        
        toggleCarga(carga.id);
        potenciaNecesaria -= carga.consumo;
        registrarEvento(`Carga no crítica apagada automáticamente: ${carga.nombre}`, 'advertencia');
    }
}

// Función para actualizar los paneles de información
function actualizarPanelesInformacion() {
    // Actualizar panel de generación
    const genPanel = document.getElementById('generationPanel');
    if (genPanel) {
        genPanel.innerHTML = `
            <div class="info-box">
                <h4>Generación</h4>
                <div class="info-value">${estadoSistema.potenciaGenerada.toFixed(1)} <small>kW</small></div>
                <div class="info-label">de ${generadores.reduce((sum, g) => sum + g.potencia, 0)} kW instalados</div>
            </div>
            <div class="info-box">
                <h4>Consumo</h4>
                <div class="info-value">${estadoSistema.potenciaRequerida.toFixed(1)} <small>kW</small></div>
                <div class="info-label">${cargas.filter(c => c.activa).length} cargas activas</div>
            </div>
            <div class="info-box">
                <h4>Eficiencia</h4>
                <div class="info-value">${estadoSistema.eficienciaTotal.toFixed(1)}<small>%</small></div>
                <div class="info-label">Pérdidas: ${estadoSistema.potenciaPerdida.toFixed(1)} kW</div>
            </div>
        `;
    }
    
    // Actualizar panel de baterías
    const batPanel = document.getElementById('batteryPanel');
    if (batPanel) {
        const estadoBateria = baterias.cargando ? 'Cargando' : 
                             baterias.descargando ? 'Descargando' : 'En espera';
        const tiempoRestante = baterias.descargando 
            ? (baterias.cargaActual / 100 * 60).toFixed(0) + ' min'
            : '--';
            
        batPanel.innerHTML = `
            <div class="battery-container">
                <div class="battery">
                    <div class="battery-level ${baterias.estadoCarga > 70 ? 'high' : 
                                             baterias.estadoCarga > 30 ? 'medium' : 'low'}" 
                         style="width: ${baterias.estadoCarga}%">
                    </div>
                </div>
                <div class="battery-info">
                    <div class="battery-percentage">${Math.round(baterias.estadoCarga)}%</div>
                    <div class="battery-status">${estadoBateria}</div>
                </div>
            </div>
            <div class="battery-details">
                <div class="detail">
                    <span>Capacidad:</span>
                    <span>${baterias.capacidad} kWh</span>
                </div>
                <div class="detail">
                    <span>Carga actual:</span>
                    <span>${baterias.cargaActual.toFixed(1)} kWh</span>
                </div>
                <div class="detail">
                    <span>Tiempo restante:</span>
                    <span>${tiempoRestante}</span>
                </div>
                <div class="detail">
                    <span>Ciclos:</span>
                    <span>${baterias.ciclos.toFixed(1)} / ${baterias.vidaUtil}</span>
                </div>
            </div>
        `;
    }
    
    // Actualizar panel de combustible
    const fuelPanel = document.getElementById('fuelPanel');
    if (fuelPanel) {
        const porcentajeCombustible = (combustible.nivel / combustible.capacidad) * 100;
        const consumoPorHora = generadores
            .filter(g => g.activo && !g.fallo)
            .reduce((total, g) => total + (g.potencia * g.consumoCombustible), 0);
            
        const horasRestantes = consumoPorHora > 0 
            ? (combustible.nivel / consumoPorHora).toFixed(1) 
            : '∞';
            
        fuelPanel.innerHTML = `
            <div class="fuel-container">
                <div class="fuel-tank">
                    <div class="fuel-level ${porcentajeCombustible > 30 ? 'high' : 'low'}" 
                         style="height: ${porcentajeCombustible}%">
                    </div>
                </div>
                <div class="fuel-info">
                    <div class="fuel-percentage">${Math.round(porcentajeCombustible)}%</div>
                    <div class="fuel-amount">${combustible.nivel.toFixed(0)} / ${combustible.capacidad} L</div>
                </div>
            </div>
            <div class="fuel-details">
                <div class="detail">
                    <span>Consumo actual:</span>
                    <span>${consumoPorHora.toFixed(1)} L/h</span>
                </div>
                <div class="detail">
                    <span>Autonomía:</span>
                    <span>${horasRestantes} h</span>
                </div>
                <div class="detail">
                    <span>Consumo total:</span>
                    <span>${combustible.consumoTotal.toFixed(1)} L</span>
                </div>
            </div>
        `;
    }
    
    // Actualizar panel de estado del sistema
    const sysPanel = document.getElementById('systemPanel');
    if (sysPanel) {
        const generadoresActivos = generadores.filter(g => g.activo && !g.fallo).length;
        const generadoresTotales = generadores.length;
        const cargasActivas = cargas.filter(c => c.activa && !c.fallo).length;
        const cargasTotales = cargas.length;
        
        sysPanel.innerHTML = `
            <div class="system-status ${estadoSistema.estado}">
                <div class="status-icon">
                    <i class="fas ${{
                        'estable': 'fa-check-circle',
                        'advertencia': 'fa-exclamation-triangle',
                        'critico': 'fa-exclamation-circle',
                        'emergencia': 'fa-radiation',
                        'sobrecargado': 'fa-bolt'
                    }[estadoSistema.estado] || 'fa-question-circle'}"></i>
                </div>
                <div class="status-details">
                    <div class="status-title">${{
                        'estable': 'Sistema Estable',
                        'advertencia': 'Advertencia',
                        'critico': 'Sistema Crítico',
                        'emergencia': 'Emergencia',
                        'sobrecargado': 'Sobrecarga'
                    }[estadoSistema.estado] || 'Estado Desconocido'}</div>
                    <div class="status-message">
                        ${obtenerMensajeEstadoSistema()}
                    </div>
                </div>
            </div>
            <div class="system-metrics">
                <div class="metric">
                    <div class="metric-value">${generadoresActivos}/${generadoresTotales}</div>
                    <div class="metric-label">Generadores</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${cargasActivas}/${cargasTotales}</div>
                    <div class="metric-label">Cargas</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${tiempoSimulacion > 0 ? Math.floor(tiempoSimulacion / 60) : '0'}:${(tiempoSimulacion % 60).toString().padStart(2, '0')}</div>
                    <div class="metric-label">Tiempo</div>
                </div>
            </div>
        `;
    }
}

// Función para obtener mensaje descriptivo del estado del sistema
function obtenerMensajeEstadoSistema() {
    const mensajes = {
        'estable': 'Todos los sistemas funcionando dentro de los parámetros normales.',
        'advertencia': 'Atención: La demanda se está acercando a la capacidad máxima.',
        'critico': '¡Precaución! El sistema está operando con capacidad reducida.',
        'emergencia': '¡EMERGENCIA! Fallo crítico en el sistema de generación.',
        'sobrecargado': 'Generación excesiva. Considere apagar generadores.'
    };
    
    return mensajes[estadoSistema.estado] || 'Estado del sistema no disponible.';
}

// Función para actualizar la interfaz de usuario
function actualizarInterfaz() {
    // Actualizar potencia total
    document.getElementById('totalPower').textContent = `${estadoSistema.potenciaDisponible} kW`;
    
    // Actualizar estado del sistema
    const statusElement = document.getElementById('statusText');
    const statusDot = document.querySelector('.power-status .status-dot');
    
    switch (estadoSistema.estado) {
        case 'estable':
            statusElement.textContent = 'Estable';
            statusElement.style.color = '#28a745';
            statusDot.style.backgroundColor = '#28a745';
            statusDot.style.boxShadow = '0 0 10px #28a745';
            break;
        case 'advertencia':
            statusElement.textContent = 'Advertencia';
            statusElement.style.color = '#ffc107';
            statusDot.style.backgroundColor = '#ffc107';
            statusDot.style.boxShadow = '0 0 10px #ffc107';
            break;
        case 'critico':
            statusElement.textContent = 'Crítico';
            statusElement.style.color = '#dc3545';
            statusDot.style.backgroundColor = '#dc3545';
            statusDot.style.boxShadow = '0 0 10px #dc3545';
            break;
    }
    
    // Actualizar botón de simulación de fallo
    const simulateBtn = document.getElementById('simulateBtn');
    if (estadoSistema.falloActivo) {
        simulateBtn.disabled = true;
        simulateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fallo activo';
    } else {
        simulateBtn.disabled = false;
        simulateBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Simular Fallo';
    }
}

// Función para actualizar los estados de las cargas
function actualizarEstadosCargas() {
    let potenciaDisponible = estadoSistema.potenciaDisponible;
    
    // Ordenar cargas por prioridad (alta, media, baja)
    const cargasOrdenadas = [...cargas].sort((a, b) => {
        const prioridades = { alta: 3, media: 2, baja: 1 };
        return prioridades[b.prioridad] - prioridades[a.prioridad];
    });
    
    // Actualizar estado de cada carga
    cargasOrdenadas.forEach(carga => {
        const cargaElement = document.getElementById(carga.id);
        const statusElement = cargaElement.querySelector('.status span');
        const statusDot = cargaElement.querySelector('.status-dot');
        
        // Verificar si hay suficiente potencia para esta carga
        if (carga.activa && potenciaDisponible >= carga.consumo) {
            // Carga activa y con suficiente potencia
            cargaElement.classList.remove('warning', 'danger');
            cargaElement.classList.add('active');
            statusElement.textContent = 'Encendido';
            statusElement.style.color = '#28a745';
            statusDot.style.backgroundColor = '#28a745';
            statusDot.style.boxShadow = '0 0 10px #28a745';
            potenciaDisponible -= carga.consumo;
        } else if (carga.activa && potenciaDisponible > 0) {
            // Carga activa pero sin suficiente potencia (modo reducido)
            cargaElement.classList.remove('active', 'danger');
            cargaElement.classList.add('warning');
            statusElement.textContent = 'Potencia reducida';
            statusElement.style.color = '#ffc107';
            statusDot.style.backgroundColor = '#ffc107';
            statusDot.style.boxShadow = '0 0 10px #ffc107';
            potenciaDisponible = 0;
        } else if (carga.activa) {
            // Carga activa pero sin energía
            cargaElement.classList.remove('active', 'warning');
            cargaElement.classList.add('danger');
            statusElement.textContent = 'Sin energía';
            statusElement.style.color = '#dc3545';
            statusDot.style.backgroundColor = '#dc3545';
            statusDot.style.boxShadow = '0 0 10px #dc3545';
        } else {
            // Carga inactiva
            cargaElement.classList.remove('active', 'warning', 'danger');
            statusElement.textContent = 'Apagado';
            statusElement.style.color = '#6c757d';
            statusDot.style.backgroundColor = '#6c757d';
            statusDot.style.boxShadow = 'none';
        }
    });
}

// Función para simular un fallo en el sistema
function simularFallo() {
    if (estadoSistema.falloActivo) return;
    
    // Encontrar un generador activo al azar
    const generadoresActivos = generadores.filter(gen => gen.activo);
    if (generadoresActivos.length === 0) {
        mostrarAlerta('No hay generadores activos para simular un fallo', 'warning');
        return;
    }
    
    // Seleccionar un generador activo al azar
    const generadorFallo = generadoresActivos[Math.floor(Math.random() * generadoresActivos.length)];
    
    // Mostrar alerta de fallo
    mostrarAlerta(`¡FALLO EN EL SISTEMA! El ${generadorFallo.nombre} ha fallado.`, 'danger');
    
    // Desactivar el generador
    generadorFallo.activo = false;
    estadoSistema.falloActivo = true;
    
    // Actualizar la interfaz
    const generadorElement = document.getElementById(generadorFallo.id);
    generadorElement.classList.remove('active');
    generadorElement.querySelector('input[type="checkbox"]').checked = false;
    
    // Actualizar el estado del sistema
    actualizarEstadoSistema();
    
    // Reactivar el botón después de 10 segundos
    setTimeout(() => {
        estadoSistema.falloActivo = false;
        actualizarInterfaz();
    }, 10000);
}

// Función para reiniciar el sistema
function reiniciarSistema() {
    // Reiniciar generadores
    generadores.forEach(gen => {
        gen.activo = false;
    });
    
    // Reiniciar cargas
    cargas.forEach(carga => {
        carga.activa = false;
    });
    
    // Reiniciar estado del sistema
    estadoSistema = {
        potenciaDisponible: 0,
        potenciaRequerida: 0,
        estado: 'critico',
        falloActivo: false
    };
    
    // Reiniciar la interfaz
    inicializarGeneradores();
    actualizarEstadoSistema();
    
    // Mostrar notificación
    mostrarAlerta('Sistema reiniciado correctamente', 'success');
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    
    let icono = '';
    switch (tipo) {
        case 'success':
            icono = '<i class="fas fa-check-circle"></i>';
            break;
        case 'warning':
            icono = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'danger':
            icono = '<i class="fas fa-exclamation-circle"></i>';
            break;
        default:
            icono = '<i class="fas fa-info-circle"></i>';
    }
    
    alerta.innerHTML = `${icono} ${mensaje}`;
    
    // Insertar la alerta al principio del contenedor
    const container = document.querySelector('.container');
    container.insertBefore(alerta, container.firstChild);
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            alerta.remove();
        }, 300);
    }, 5000);
}

// Eventos para activar/desactivar cargas
document.addEventListener('DOMContentLoaded', function() {
    // Agregar eventos de clic a las cargas
    document.querySelectorAll('.load-item').forEach(item => {
        item.addEventListener('click', function() {
            const cargaId = this.id;
            const carga = cargas.find(c => c.id === cargaId);
            
            if (carga) {
                // Cambiar estado de la carga
                carga.activa = !carga.activa;
                this.classList.toggle('active', carga.activa);
                
                // Actualizar el estado del sistema
                actualizarEstadoSistema();
                
                // Mostrar notificación
                const estado = carga.activa ? 'activada' : 'desactivada';
                mostrarAlerta(`Carga ${carga.nombre} ${estado}`, 'success');
            }
        });
    });
    
    // Agregar evento de tecla Enter al campo de entrada
    document.getElementById('kwInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertirPotencia();
        }
    });
    
    // Inicializar funcionalidad del modal de ayuda
    inicializarModalAyuda();
});

// Funcionalidad del modal de ayuda
function inicializarModalAyuda() {
    const modal = document.getElementById('helpModal');
    const btnAbrir = document.getElementById('helpButton');
    const btnCerrar = document.querySelector('.close-modal');
    const btnCerrarFooter = document.querySelector('.btn-close');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Abrir modal
    btnAbrir.addEventListener('click', function() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Evitar scroll del fondo
    });
    
    // Cerrar modal
    function cerrarModal() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar scroll
        
        // Pequeño retraso para la animación
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Eventos para cerrar el modal
    btnCerrar.addEventListener('click', cerrarModal);
    btnCerrarFooter.addEventListener('click', cerrarModal);
    
    // Cerrar al hacer clic fuera del contenido del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });
    
    // Cerrar con la tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            cerrarModal();
        }
    });
    
    // Funcionalidad de las pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remover clase activa de todos los botones y paneles
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activar el botón y panel correspondiente
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}
