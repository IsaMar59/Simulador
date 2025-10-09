// Mostrar mensaje de bienvenida al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Mensaje de bienvenida
    setTimeout(() => {
        alert('¡Bienvenido al apartado final del simulador desarrollado por Isaura Ríos!');
    }, 500);

    // Configuración del botón de contacto
    const contactoBtn = document.getElementById('contactoBtn');
    if (contactoBtn) {
        contactoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear elemento de mensaje flotante
            const mensajeFlotante = document.createElement('div');
            mensajeFlotante.className = 'floating-message';
            mensajeFlotante.innerHTML = `
                <div class="floating-content">
                    <h4>¡Gracias por tu interés!</h4>
                    <p>Ponte en contacto conmigo a través de:</p>
                    <div class="contacto-opciones">
                        <a href="mailto:tuemail@ejemplo.com" class="btn-contacto-email">
                            <i class="fas fa-envelope"></i> Email
                        </a>
                        <a href="https://linkedin.com/in/tuperfil" target="_blank" class="btn-contacto-linkedin">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </div>
                    <button class="btn-cerrar">Cerrar</button>
                </div>
            `;
            
            // Añadir estilos al mensaje flotante
            const estilo = document.createElement('style');
            estilo.textContent = `
                .floating-message {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    animation: fadeIn 0.3s forwards;
                }
                
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                
                .floating-content {
                    background: var(--dark-bg);
                    padding: 2rem;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    position: relative;
                    border: 1px solid var(--accent-color);
                }
                
                .floating-content h4 {
                    color: var(--secondary-color);
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                }
                
                .floating-content p {
                    margin-bottom: 1.5rem;
                    color: var(--text-light);
                }
                
                .contacto-opciones {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .btn-contacto-email, .btn-contacto-linkedin {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.8rem;
                    border-radius: 5px;
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    transition: transform 0.2s, opacity 0.2s;
                }
                
                .btn-contacto-email {
                    background: #EA4335;
                }
                
                .btn-contacto-linkedin {
                    background: #0A66C2;
                }
                
                .btn-contacto-email:hover, .btn-contacto-linkedin:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }
                
                .btn-cerrar {
                    background: none;
                    border: 1px solid var(--accent-color);
                    color: var(--text-light);
                    padding: 0.5rem 1.5rem;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                .btn-cerrar:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `;
            
            document.head.appendChild(estilo);
            document.body.appendChild(mensajeFlotante);
            
            // Cerrar el mensaje flotante
            const btnCerrar = mensajeFlotante.querySelector('.btn-cerrar');
            btnCerrar.addEventListener('click', function() {
                mensajeFlotante.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    mensajeFlotante.remove();
                    estilo.remove();
                }, 300);
            });
            
            // Añadir animación de cierre
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        });
    }
    
    // Efecto de aparición suave para las tarjetas
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Aplicar a las tarjetas
    document.querySelectorAll('.perfil-card, .motivacion-card, .tecnologia').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Variables del juego
let canvas, ctx;
let gameRunning = false;
let animationId;
let score = 0;
let lives = 3;

// Configuración del barco
const ship = {
    x: 100,
    y: 200,
    width: 60,
    height: 30,
    speed: 5,
    color: '#3a86ff',
    isMoving: { up: false, right: false, down: false, left: false }
};

// Configuración de los contenedores
const containers = [];
const containerSize = 20;
let containerSpawnTimer = 0;
const containerSpawnInterval = 120; // frames

// Configuración de obstáculos
const obstacles = [];
const obstacleSize = 25;
let obstacleSpawnTimer = 0;
const obstacleSpawnInterval = 180; // frames

// Inicializar el juego
function initGame() {
    canvas = document.getElementById('shipGame');
    ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas
    canvas.width = Math.min(800, window.innerWidth - 40);
    canvas.height = 400;
    
    // Reiniciar estado del juego
    resetGame();
    
    // Configurar eventos de teclado
    setupKeyboardControls();
    
    // Configurar botón de inicio
    const startButton = document.getElementById('startGame');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Iniciar el bucle del juego
    if (!gameRunning) {
        gameLoop();
    }
}

// Reiniciar el juego
function resetGame() {
    // Reiniciar puntuación y vidas
    score = 0;
    lives = 3;
    updateScore();
    updateLives();
    
    // Reiniciar posición del barco
    ship.x = 100;
    ship.y = canvas.height / 2 - ship.height / 2;
    
    // Limpiar arrays de objetos del juego
    containers.length = 0;
    obstacles.length = 0;
    
    // Reiniciar temporizadores
    containerSpawnTimer = 0;
    obstacleSpawnTimer = 0;
}

// Configurar controles de teclado
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                ship.isMoving.up = true;
                break;
            case 'ArrowRight':
                ship.isMoving.right = true;
                break;
            case 'ArrowDown':
                ship.isMoving.down = true;
                break;
            case 'ArrowLeft':
                ship.isMoving.left = true;
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                ship.isMoving.up = false;
                break;
            case 'ArrowRight':
                ship.isMoving.right = false;
                break;
            case 'ArrowDown':
                ship.isMoving.down = false;
                break;
            case 'ArrowLeft':
                ship.isMoving.left = false;
                break;
        }
    });
    
    // Controles táctiles para móviles
    const gameContainer = document.querySelector('.game-canvas-container');
    if (gameContainer) {
        let touchStartX = 0;
        let touchStartY = 0;
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (!gameRunning) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        gameContainer.addEventListener('touchmove', (e) => {
            if (!gameRunning) return;
            e.preventDefault();
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            // Mover el barco según el desplazamiento táctil
            const dx = touchX - touchStartX;
            const dy = touchY - touchStartY;
            
            ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x + dx * 0.5));
            ship.y = Math.max(0, Math.min(canvas.height - ship.height, ship.y + dy * 0.5));
            
            touchStartX = touchX;
            touchStartY = touchY;
        });
    }
}

// Actualizar puntuación
function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Actualizar vidas
function updateLives() {
    const livesElement = document.getElementById('lives');
    if (livesElement) {
        livesElement.textContent = lives;
    }
}

// Iniciar el juego
function startGame() {
    if (!gameRunning) {
        resetGame();
        gameRunning = true;
        const startButton = document.getElementById('startGame');
        if (startButton) {
            startButton.textContent = 'Reiniciar Juego';
        }
    } else {
        resetGame();
    }
}

// Bucle principal del juego
function gameLoop() {
    if (gameRunning) {
        update();
    }
    render();
    animationId = requestAnimationFrame(gameLoop);
}

// Actualizar lógica del juego
function update() {
    // Mover el barco
    if (ship.isMoving.up) ship.y = Math.max(0, ship.y - ship.speed);
    if (ship.isMoving.right) ship.x = Math.min(canvas.width - ship.width, ship.x + ship.speed);
    if (ship.isMoving.down) ship.y = Math.min(canvas.height - ship.height, ship.y + ship.speed);
    if (ship.isMoving.left) ship.x = Math.max(0, ship.x - ship.speed);
    
    // Generar contenedores
    containerSpawnTimer++;
    if (containerSpawnTimer >= containerSpawnInterval) {
        spawnContainer();
        containerSpawnTimer = 0;
    }
    
    // Generar obstáculos
    obstacleSpawnTimer++;
    if (obstacleSpawnTimer >= obstacleSpawnInterval) {
        spawnObstacle();
        obstacleSpawnTimer = 0;
    }
    
    // Actualizar contenedores
    for (let i = containers.length - 1; i >= 0; i--) {
        containers[i].x -= 2;
        
        // Verificar colisión con el barco
        if (checkCollision(
            ship.x, ship.y, ship.width, ship.height,
            containers[i].x, containers[i].y, containerSize, containerSize
        )) {
            containers.splice(i, 1);
            score += 10;
            updateScore();
            playSound('collect');
            continue;
        }
        
        // Eliminar contenedores que salen de la pantalla
        if (containers[i].x + containerSize < 0) {
            containers.splice(i, 1);
        }
    }
    
    // Actualizar obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 3;
        
        // Verificar colisión con el barco
        if (checkCollision(
            ship.x, ship.y, ship.width, ship.height,
            obstacles[i].x, obstacles[i].y, obstacleSize, obstacleSize
        )) {
            obstacles.splice(i, 1);
            lives--;
            updateLives();
            playSound('crash');
            
            if (lives <= 0) {
                gameOver();
            }
            continue;
        }
        
        // Eliminar obstáculos que salen de la pantalla
        if (obstacles[i].x + obstacleSize < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// Renderizar el juego
function render() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo
    drawWaterBackground();
    
    // Dibujar contenedores
    containers.forEach(container => {
        drawContainer(container.x, container.y);
    });
    
    // Dibujar obstáculos
    obstacles.forEach(obstacle => {
        drawObstacle(obstacle.x, obstacle.y);
    });
    
    // Dibujar barco
    drawShip();
    
    // Mostrar mensaje de juego terminado
    if (!gameRunning && lives <= 0) {
        drawGameOver();
    }
}

// Dibujar el barco
function drawShip() {
    ctx.save();
    
    // Cuerpo del barco
    ctx.fillStyle = ship.color;
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.width * 0.2, ship.y);
    ctx.lineTo(ship.x + ship.width * 0.8, ship.y);
    ctx.lineTo(ship.x + ship.width, ship.y + ship.height * 0.5);
    ctx.lineTo(ship.x + ship.width * 0.8, ship.y + ship.height);
    ctx.lineTo(ship.x + ship.width * 0.2, ship.y + ship.height);
    ctx.closePath();
    ctx.fill();
    
    // Cabina
    ctx.fillStyle = '#1a4b8c';
    ctx.fillRect(
        ship.x + ship.width * 0.4, 
        ship.y + ship.height * 0.2, 
        ship.width * 0.3, 
        ship.height * 0.6
    );
    
    // Ventanas
    ctx.fillStyle = '#b3e0ff';
    ctx.beginPath();
    ctx.arc(
        ship.x + ship.width * 0.55, 
        ship.y + ship.height * 0.5, 
        ship.width * 0.08, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.restore();
}

// Dibujar contenedor
function drawContainer(x, y) {
    ctx.save();
    
    // Cuerpo del contenedor
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x, y, containerSize, containerSize * 0.8);
    
    // Tapa del contenedor
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(x, y, containerSize, containerSize * 0.15);
    
    // Detalles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, containerSize - 4, containerSize * 0.8 - 4);
    
    // Texto del contenedor (🟦)
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🟦', x + containerSize / 2, y + containerSize * 0.5);
    
    ctx.restore();
}

// Dibujar obstáculo
function drawObstacle(x, y) {
    ctx.save();
    
    // Cuerpo del obstáculo
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(x + obstacleSize * 0.5, y);
    ctx.lineTo(x + obstacleSize, y + obstacleSize * 0.5);
    ctx.lineTo(x + obstacleSize * 0.5, y + obstacleSize);
    ctx.lineTo(x, y + obstacleSize * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Detalles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Texto del obstáculo (💥)
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥', x + obstacleSize / 2, y + obstacleSize / 2);
    
    ctx.restore();
}

// Dibujar fondo de agua
function drawWaterBackground() {
    // Gradiente para el agua
    const waterGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    waterGradient.addColorStop(0, '#0a2e4a');
    waterGradient.addColorStop(1, '#051c33');
    
    // Fondo de agua
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Olas
    ctx.strokeStyle = 'rgba(58, 134, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let y = 20; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x < canvas.width; x += 10) {
            const yOffset = Math.sin(x * 0.05 + Date.now() * 0.001) * 3;
            ctx.lineTo(x, y + yOffset);
        }
        
        ctx.stroke();
    }
}

// Dibujar pantalla de juego terminado
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('¡Juego Terminado!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Puntuación: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#3a86ff';
    ctx.fillText('Haz clic en "Reiniciar Juego" para jugar de nuevo', canvas.width / 2, canvas.height / 2 + 70);
}

// Generar un nuevo contenedor
function spawnContainer() {
    const y = Math.random() * (canvas.height - containerSize * 2) + containerSize;
    containers.push({
        x: canvas.width,
        y: y
    });
}

// Generar un nuevo obstáculo
function spawnObstacle() {
    const y = Math.random() * (canvas.height - obstacleSize * 2) + obstacleSize;
    obstacles.push({
        x: canvas.width,
        y: y
    });
}

// Verificar colisión entre dos rectángulos
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
}

// Finalizar el juego
function gameOver() {
    gameRunning = false;
    playSound('gameOver');
}

// Reproducir sonidos
function playSound(type) {
    // En un entorno real, aquí iría el código para reproducir efectos de sonido
    // Por ejemplo: new Audio(`sounds/${type}.mp3`).play();
    
    // Para este ejemplo, solo mostramos un mensaje en la consola
    console.log(`Playing sound: ${type}`);
}

// Efecto de escritura para el título
function typeWriter(element, text, i = 0) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(() => typeWriter(element, text, i), 50);
    }
}

// Iniciar efecto de escritura cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    const titulo = document.querySelector('.acerca-header h1');
    if (titulo) {
        const texto = titulo.textContent;
        titulo.textContent = '';
        typeWriter(titulo, texto);
    }
    
    // Inicializar el juego cuando el DOM esté listo
    initGame();
    
    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
        if (canvas) {
            const container = document.querySelector('.game-canvas-container');
            if (container) {
                canvas.width = container.clientWidth - 40;
                canvas.height = 400;
            }
        }
    });
});
