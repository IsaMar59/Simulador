// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li a');
    const moduleCards = document.querySelectorAll('.module-card');

    // Menú hamburguesa para móviles
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Efecto hover en las tarjetas de módulos
    moduleCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.module-icon');
            icon.style.transform = 'rotateY(180deg)';
            setTimeout(() => {
                icon.style.transform = 'rotateY(0deg)';
            }, 500);
        });

        // Navegación a las secciones correspondientes
        card.addEventListener('click', function() {
            const moduleId = this.id;
            // Aquí manejaremos la navegación a cada módulo específico
            console.log(`Navegando al módulo: ${moduleId}`);
            // Por ahora, simplemente mostramos un mensaje en la consola
            // Más adelante implementaremos la navegación real
        });
    });

    // Animación de scroll suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajuste para la barra de navegación fija
                    behavior: 'smooth'
                });
            }
        });
    });

    // Efecto de aparición suave al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos con la clase 'fade-in'
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // Mostrar año actual en el footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.textContent = yearElement.textContent.replace('2023', currentYear);
    }
});

// Funciones para los módulos del simulador
function initUnitConverter() {
    // Implementaremos esto más adelante
    console.log('Inicializando conversor de unidades');
}

function initPowerCalculator() {
    // Implementaremos esto más adelante
    console.log('Inicializando calculadora de potencia');
}

function initElectricalDiagram() {
    // Implementaremos esto más adelante
    console.log('Inicializando diagrama eléctrico');
}

function initFaultSimulation() {
    // Implementaremos esto más adelante
    console.log('Inicializando simulación de fallos');
}

// Inicializar los módulos cuando se cargue la página
window.addEventListener('load', function() {
    // Aquí inicializaremos los módulos específicos cuando estén listos
});
