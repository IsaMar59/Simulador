// Definición del componente de encabezado personalizado
class CustomHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    position: relative;
                }
                
                .navbar {
                    background-color: var(--primary-color, #001F3F);
                    color: white;
                    padding: 1rem 0;
                    position: fixed;
                    width: 100%;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .container {
                    width: 90%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-decoration: none;
                    color: white;
                }

                .logo i {
                    margin-right: 10px;
                    color: var(--secondary-color, #FFD700);
                }

                .nav-links {
                    display: flex;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .nav-links li a {
                    color: white;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    transition: color 0.3s ease;
                    font-weight: 500;
                }

                .nav-links li a:hover,
                .nav-links li a.active {
                    color: var(--secondary-color, #FFD700);
                }

                .hamburger {
                    display: none;
                    cursor: pointer;
                    font-size: 1.5rem;
                    color: white;
                }

                /* Estilos para móviles */
                @media (max-width: 768px) {
                    .container {
                        padding: 0 20px;
                    }
                    
                    .logo span {
                        font-size: 1.3rem;
                    }
                    
                    .hamburger {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        transition: all 0.3s ease;
                    }
                    
                    .hamburger:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .hamburger i {
                        font-size: 1.5rem;
                    }
                    
                    .nav-links {
                        position: fixed;
                        top: 70px;
                        left: -100%;
                        width: 280px;
                        height: calc(100vh - 70px);
                        background-color: var(--primary-color, #001F3F);
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 1.5rem 2rem;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
                        overflow-y: auto;
                        z-index: 1000;
                    }
                    
                    .nav-links.active {
                        left: 0;
                    }
                    
                    .nav-links li {
                        width: 100%;
                        margin: 0.8rem 0;
                        opacity: 0;
                        transform: translateX(-20px);
                        transition: all 0.3s ease;
                    }
                    
                    .nav-links.active li {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    
                    /* Animación escalonada para los elementos del menú */
                    .nav-links.active li:nth-child(1) { transition-delay: 0.1s; }
                    .nav-links.active li:nth-child(2) { transition-delay: 0.15s; }
                    .nav-links.active li:nth-child(3) { transition-delay: 0.2s; }
                    .nav-links.active li:nth-child(4) { transition-delay: 0.25s; }
                    .nav-links.active li:nth-child(5) { transition-delay: 0.3s; }
                    
                    .nav-links li a {
                        display: block;
                        width: 100%;
                        padding: 0.8rem 1rem;
                        font-size: 1.1rem;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                    }
                    
                    .nav-links li a:hover,
                    .nav-links li a.active {
                        background: rgba(255, 255, 255, 0.1);
                        padding-left: 1.5rem;
                    }
                    
                    /* Overlay para cerrar el menú al tocar fuera */
                    .nav-overlay {
                        display: none;
                        position: fixed;
                        top: 70px;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 999;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }
                    
                    .nav-overlay.active {
                        display: block;
                        opacity: 1;
                    }
                }
                
                /* Ajustes para pantallas muy pequeñas */
                @media (max-width: 480px) {
                    .logo span {
                        font-size: 1.1rem;
                    }
                    
                    .hamburger {
                        width: 36px;
                        height: 36px;
                    }
                    
                    .nav-links {
                        width: 260px;
                        padding: 1rem 1.5rem;
                    }
                }
            </style>
            
            <nav class="navbar">
                <div class="container">
                    <a href="/index.html" class="logo">
                        <i class="fas fa-bolt"></i>
                        <span>Simulador Náutico</span>
                    </a>
                    <ul class="nav-links">
                        <li><a href="/index.html" class="active">Inicio</a></li>
                        <li><a href="../pages/simulador.html">Simulador</a></li>
                        <li><a href="../pages/herramientas.html">Herramientas</a></li>
                        <li><a href="../pages/aprende.html">Aprende</a></li>
                        <li><a href="../pages/acerca.html">Acerca de</a></li>
                    </ul>
                    <div class="hamburger">
                        <i class="fas fa-bars"></i>
                    </div>
                </div>
            </nav>
        `;
    }

    addEventListeners() {
        const hamburger = this.shadowRoot.querySelector('.hamburger');
        const navLinks = this.shadowRoot.querySelector('.nav-links');
        const navLinksItems = this.shadowRoot.querySelectorAll('.nav-links li a');
        
        // Crear overlay dinámicamente
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        this.shadowRoot.querySelector('.navbar').appendChild(overlay);

        // Función para abrir/cerrar el menú
        const toggleMenu = (open) => {
            const isOpen = navLinks.classList.contains('active');
            const shouldOpen = open !== undefined ? open : !isOpen;
            
            if (shouldOpen) {
                document.body.style.overflow = 'hidden'; // Evitar scroll del body
                navLinks.classList.add('active');
                overlay.classList.add('active');
                hamburger.classList.add('active');
            } else {
                document.body.style.overflow = ''; // Restaurar scroll
                navLinks.classList.remove('active');
                overlay.classList.remove('active');
                hamburger.classList.remove('active');
            }
        };

        // Menú hamburguesa para móviles
        if (hamburger) {
            // Click en el botón de hamburguesa
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
            
            // Soporte para gestos táctiles
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            
            hamburger.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
            }, { passive: true });
            
            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
            }, { passive: true });
            
            document.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                // Si el deslizamiento es significativo, alternar el menú
                if (Math.abs(currentX - startX) > 50) {
                    toggleMenu();
                }
            }, { passive: true });
        }

        // Cerrar menú al hacer clic en un enlace
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });
        
        // Cerrar menú al hacer clic en el overlay
        overlay.addEventListener('click', () => {
            toggleMenu(false);
        });
        
        // Cerrar menú al cambiar el tamaño de la ventana (si se hace más grande que mobile)
        const handleResize = () => {
            if (window.innerWidth > 768) {
                toggleMenu(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Limpiar eventos al desmontar el componente
        this.cleanup = () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = ''; // Asegurar que el scroll se restablezca
        };
    }
    
    // Limpiar eventos cuando el componente se desconecta
    disconnectedCallback() {
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

// Registrar el componente personalizado
customElements.define('custom-header', CustomHeader);
