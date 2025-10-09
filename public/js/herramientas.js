// Constantes de conversión
const CONVERSION_FACTORS = {
    kW: { HP: 1.34102, CV: 1.35962, kW: 1 },
    HP: { kW: 0.7457, CV: 1.01387, HP: 1 },
    CV: { kW: 0.7355, HP: 0.98632, CV: 1 }
};

// Variables globales
let consumptionChart = null;

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el conversor de unidades
    initUnitConverter();
    
    // Inicializar la calculadora trifásica
    initThreePhaseCalculator();
    
    // Inicializar el simulador de consumo
    initConsumptionSimulator();
});

/**
 * Inicializa el conversor de unidades de potencia
 */
function initUnitConverter() {
    const convertBtn = document.getElementById('convertBtn');
    const resultDiv = document.getElementById('result');
    
    convertBtn.addEventListener('click', function() {
        const inputValue = parseFloat(document.getElementById('inputValue').value);
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;
        
        if (isNaN(inputValue)) {
            showError(resultDiv, 'Por favor, ingrese un valor numérico válido');
            return;
        }
        
        const result = convertPower(inputValue, fromUnit, toUnit);
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <strong>Resultado:</strong> ${inputValue} ${fromUnit} = 
            <span class="highlight">${result.toFixed(4)} ${toUnit}</span>
        `;
    });
}

/**
 * Convierte un valor de una unidad de potencia a otra
 * @param {number} value - Valor a convertir
 * @param {string} fromUnit - Unidad de origen (kW, HP, CV)
 * @param {string} toUnit - Unidad de destino (kW, HP, CV)
 * @returns {number} Valor convertido
 */
function convertPower(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    return value * CONVERSION_FACTORS[fromUnit][toUnit];
}

/**
 * Inicializa la calculadora de potencia trifásica
 */
function initThreePhaseCalculator() {
    const calculateBtn = document.getElementById('calculate3Phase');
    const resultDiv = document.getElementById('powerResult');
    
    calculateBtn.addEventListener('click', function() {
        const voltage = parseFloat(document.getElementById('voltage').value);
        const current = parseFloat(document.getElementById('current').value);
        const powerFactor = parseFloat(document.getElementById('powerFactor').value);
        
        if (isNaN(voltage) || isNaN(current) || isNaN(powerFactor)) {
            showError(resultDiv, 'Por favor, complete todos los campos con valores numéricos');
            return;
        }
        
        if (powerFactor < 0 || powerFactor > 1) {
            showError(resultDiv, 'El factor de potencia debe estar entre 0 y 1');
            return;
        }
        
        // Cálculo de potencia trifásica: P = √3 * V * I * FP
        const powerKW = (Math.sqrt(3) * voltage * current * powerFactor) / 1000;
        const powerHP = powerKW * CONVERSION_FACTORS.kW.HP;
        const powerCV = powerKW * CONVERSION_FACTORS.kW.CV;
        
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <p><strong>Potencia Aparente (kVA):</strong> ${(powerKW / powerFactor).toFixed(2)} kVA</p>
            <p><strong>Potencia Activa (kW):</strong> ${powerKW.toFixed(2)} kW</p>
            <p><strong>Potencia en HP:</strong> ${powerHP.toFixed(2)} HP</p>
            <p><strong>Potencia en CV:</strong> ${powerCV.toFixed(2)} CV</p>
            <p><strong>Corriente de Línea:</strong> ${current.toFixed(2)} A</p>
            <p><strong>Factor de Potencia:</strong> ${(powerFactor * 100).toFixed(0)}%</p>
        `;
    });
}

/**
 * Inicializa el simulador de consumo
 */
function initConsumptionSimulator() {
    const consumersInput = document.getElementById('consumers');
    const consumerInputsDiv = document.getElementById('consumerInputs');
    const simulateBtn = document.getElementById('simulateBtn');
    
    // Cargar datos de ejemplo de consumos típicos
    const defaultConsumers = [
        { name: 'Motor Principal', power: 50 },
        { name: 'Luces de Navegación', power: 0.5 },
        { name: 'Electrónica de Abordo', power: 1.5 },
        { name: 'Bombas de Agua', power: 2.5 },
        { name: 'Cocina', power: 3.0 }
    ];
    
    // Generar campos de entrada iniciales
    function generateConsumerInputs(count) {
        consumerInputsDiv.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const consumerDiv = document.createElement('div');
            consumerDiv.className = 'consumer-input';
            
            const name = document.createElement('input');
            name.type = 'text';
            name.placeholder = 'Nombre del consumidor';
            name.value = defaultConsumers[i]?.name || `Consumidor ${i + 1}`;
            
            const power = document.createElement('input');
            power.type = 'number';
            power.placeholder = 'Potencia (kW)';
            power.step = '0.1';
            power.min = '0';
            power.value = defaultConsumers[i]?.power || '1.0';
            
            consumerDiv.appendChild(name);
            consumerDiv.appendChild(power);
            consumerInputsDiv.appendChild(consumerDiv);
        }
    }
    
    // Actualizar campos cuando cambia el número de consumidores
    consumersInput.addEventListener('change', function() {
        generateConsumerInputs(parseInt(this.value));
    });
    
    // Inicializar con valores por defecto
    generateConsumerInputs(parseInt(consumersInput.value));
    
    // Configurar el evento de simulación
    simulateBtn.addEventListener('click', runConsumptionSimulation);
}

/**
 * Ejecuta la simulación de consumo
 */
function runConsumptionSimulation() {
    const hours = parseFloat(document.getElementById('hours').value);
    const consumerInputs = document.querySelectorAll('.consumer-input');
    const resultDiv = document.getElementById('simulationResult');
    
    if (isNaN(hours) || hours <= 0) {
        showError(resultDiv, 'Por favor, ingrese un número válido de horas');
        return;
    }
    
    const consumers = [];
    let totalDailyConsumption = 0;
    
    // Recolectar datos de consumidores
    consumerInputs.forEach((consumerDiv, index) => {
        const name = consumerDiv.querySelector('input[type="text"]').value || `Consumidor ${index + 1}`;
        const power = parseFloat(consumerDiv.querySelector('input[type="number"]').value) || 0;
        
        if (power > 0) {
            const dailyConsumption = power * hours; // kWh
            totalDailyConsumption += dailyConsumption;
            
            consumers.push({
                name,
                power,
                dailyConsumption,
                percentage: 0 // Se calculará después
            });
        }
    });
    
    if (consumers.length === 0) {
        showError(resultDiv, 'Por favor, ingrese al menos un consumidor con potencia mayor a 0');
        return;
    }
    
    // Calcular porcentajes
    consumers.forEach(consumer => {
        consumer.percentage = (consumer.dailyConsumption / totalDailyConsumption) * 100;
    });
    
    // Ordenar por consumo descendente
    consumers.sort((a, b) => b.dailyConsumption - a.dailyConsumption);
    
    // Mostrar resultados
    displayConsumptionResults(consumers, totalDailyConsumption, hours);
    
    // Generar gráfico
    generateConsumptionChart(consumers);
}

/**
 * Muestra los resultados de la simulación de consumo
 */
function displayConsumptionResults(consumers, totalDailyConsumption, hours) {
    const resultDiv = document.getElementById('simulationResult');
    resultDiv.style.display = 'block';
    
    let html = `
        <h3>Resultados de la Simulación</h3>
        <p><strong>Período de simulación:</strong> ${hours} horas</p>
        <p><strong>Consumo total diario:</strong> ${totalDailyConsumption.toFixed(2)} kWh</p>
        <h4>Desglose por consumidor:</h4>
        <table class="consumption-table">
            <thead>
                <tr>
                    <th>Consumidor</th>
                    <th>Potencia (kW)</th>
                    <th>Consumo (kWh)</th>
                    <th>% del Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    consumers.forEach(consumer => {
        html += `
            <tr>
                <td>${consumer.name}</td>
                <td>${consumer.power.toFixed(2)} kW</td>
                <td>${consumer.dailyConsumption.toFixed(2)} kWh</td>
                <td>${consumer.percentage.toFixed(1)}%</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    resultDiv.innerHTML = html;
}

/**
 * Genera un gráfico de consumo
 */
function generateConsumptionChart(consumers) {
    const ctx = document.getElementById('consumptionChart').getContext('2d');
    
    // Destruir el gráfico anterior si existe
    if (consumptionChart) {
        consumptionChart.destroy();
    }
    
    const labels = consumers.map(c => c.name);
    const data = consumers.map(c => c.dailyConsumption);
    const backgroundColors = generateColors(consumers.length);
    
    consumptionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toFixed(2)} kWh (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Genera un array de colores aleatorios
 */
function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const hue = (i * hueStep) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
}

/**
 * Muestra un mensaje de error
 */
function showError(element, message) {
    element.style.display = 'block';
    element.innerHTML = `<div class="error-message">
        <i class="fas fa-exclamation-circle"></i> ${message}
    </div>`;
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Exportar funciones para pruebas
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertPower,
        generateColors
    };
}
