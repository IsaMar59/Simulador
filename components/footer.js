// Definición del componente de pie de página personalizado
class CustomFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        const currentYear = new Date().getFullYear();
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                
                .footer {
                    background-color: var(--primary-color, #001F3F);
                    color: white;
                    padding: 4rem 0 0;
                }
                
                .container {
                    width: 90%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 15px;
                }
                
                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .footer-section h4 {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    padding-bottom: 0.8rem;
                    color: var(--secondary-color, #FFD700);
                }
                
                .footer-section h4::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 50px;
                    height: 2px;
                    background-color: var(--secondary-color, #FFD700);
                }
                
                .footer-section p {
                    margin-bottom: 1rem;
                    opacity: 0.8;
                    line-height: 1.6;
                }
                
                .footer-section ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .footer-section ul li {
                    margin-bottom: 0.8rem;
                }
                
                .footer-section ul li a {
                    color: white;
                    text-decoration: none;
                    transition: color 0.3s ease;
                    display: inline-block;
                }
                
                .footer-section ul li a:hover {
                    color: var(--secondary-color, #FFD700);
                    transform: translateX(5px);
                }
                
                .social-links {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                
                .social-links a {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    color: white;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }
                
                .social-links a:hover {
                    background-color: var(--secondary-color, #FFD700);
                    color: var(--primary-color, #001F3F);
                    transform: translateY(-3px);
                }
                
                .footer-bottom {
                    text-align: center;
                    padding: 1.5rem 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: 2rem;
                }
                
                .footer-bottom p {
                    font-size: 0.9rem;
                    opacity: 0.7;
                    margin: 0;
                }
                
                @media (max-width: 768px) {
                    .footer-content {
                        grid-template-columns: 1fr;
                        gap: 2.5rem;
                    }
                    
                    .footer-section {
                        text-align: center;
                    }
                    
                    .footer-section h4::after {
                        left: 50%;
                        transform: translateX(-50%);
                    }
                    
                    .social-links {
                        justify-content: center;
                    }
                }
            </style>
            
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>Simulador Náutico-Eléctrico</h4>
                            <p>Herramienta educativa para el aprendizaje de sistemas eléctricos en buques.</p>
                        </div>
                        <div class="footer-section">
                            <h4>Enlaces Rápidos</h4>
                            <ul>
                                <li><a href="/public/index.html">Inicio</a></li>
                                <li><a href="/public/pages/simulador.html">Simulador</a></li>
                                <li><a href="/public/pages/herramientas.html">Aprende</a></li>
                                <li><a href="/public/pages/acerca.html">Acerca de</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Contacto</h4>
                            <p>Desarrollado por Isaura Ríos</p>
                            <div class="social-links">
                                    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                                    <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; ${currentYear} Simulador Náutico-Eléctrico. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Registrar el componente personalizado
customElements.define('custom-footer', CustomFooter);
