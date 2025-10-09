// Datos de los generadores
const generadores = [
    { id: 'gen1', nombre: 'Generador Principal 1', potencia: 500, activo: false },
    { id: 'gen2', nombre: 'Generador Principal 2', potencia: 500, activo: false },
    { id: 'gen3', nombre: 'Generador de Emergencia', potencia: 250, activo: false },
    { id: 'gen4', nombre: 'Generador Auxiliar', potencia: 150, activo: false }
];

// Datos de las cargas
const cargas = [
    { id: 'iluminacion', nombre: 'Iluminación', consumo: 150, activa: false, prioridad: 'media' },
    { id: 'bomba', nombre: 'Bomba de Agua', consumo: 250, activa: false, prioridad: 'alta' },
    { id: 'radar', nombre: 'Radar', consumo: 100, activa: false, prioridad: 'alta' },
    { id: 'propulsion', nombre: 'Propulsión', consumo: 800, activa: false, prioridad: 'baja' }
];

// Estado del sistema
let estadoSistema = {
    potenciaDisponible: 0,
    potenciaRequerida: 0,
    estado: 'critico', // 'critico', 'advertencia', 'estable'
    falloActivo: false
};

// Inicialización del simulador
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar generadores
    inicializarGeneradores();
    
    // Inicializar eventos
    document.getElementById('simulateBtn').addEventListener('click', simularFallo);
    
    // Actualizar el estado inicial
    actualizarEstadoSistema();
});

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
    // Calcular potencia total disponible
    const potenciaTotal = generadores
        .filter(gen => gen.activo)
        .reduce((total, gen) => total + gen.potencia, 0);
    
    estadoSistema.potenciaDisponible = potenciaTotal;
    
    // Calcular potencia requerida por cargas activas
    const potenciaRequerida = cargas
        .filter(carga => carga.activa)
        .reduce((total, carga) => total + carga.consumo, 0);
    
    estadoSistema.potenciaRequerida = potenciaRequerida;
    
    // Determinar el estado del sistema
    if (potenciaDisponible >= potenciaRequerida) {
        estadoSistema.estado = 'estable';
    } else if (potenciaDisponible >= potenciaRequerida * 0.7) {
        estadoSistema.estado = 'advertencia';
    } else {
        estadoSistema.estado = 'critico';
    }
    
    // Actualizar la interfaz
    actualizarInterfaz();
    
    // Actualizar estados de las cargas
    actualizarEstadosCargas();
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
