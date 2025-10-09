document.addEventListener('DOMContentLoaded', function() {
    // Configuración del quiz
    const quizData = [
        {
            question: '¿Cuál es la unidad básica de potencia eléctrica?',
            options: [
                'Amperio (A)',
                'Vatio (W)',
                'Ohmio (Ω)',
                'Voltio (V)'
            ],
            correct: 1
        },
        {
            question: '¿Qué componente convierte la energía mecánica en eléctrica en un generador?',
            options: [
                'Motor diésel',
                'Alternador',
                'Transformador',
                'Rectificador'
            ],
            correct: 1
        },
        {
            question: '¿Qué elemento del sistema de distribución protege contra sobrecargas?',
            options: [
                'Barras colectoras',
                'Interruptor automático',
                'Transformador',
                'Conmutador de transferencia'
            ],
            correct: 1
        }
    ];

    // Variables del DOM
    const quizContainer = document.querySelector('.quiz-container');
    const questionElement = document.querySelector('.quiz-question h3');
    const optionsContainer = document.querySelector('.quiz-options');
    const feedbackElement = document.querySelector('.feedback-text');
    let currentQuestion = 0;
    let score = 0;

    // Cargar la pregunta actual
    function loadQuestion(questionIndex) {
        const question = quizData[questionIndex];
        questionElement.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = option;
            button.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(button);
        });
        
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback-text';
    }

    // Manejar la selección de opción
    function selectOption(selectedIndex) {
        const question = quizData[currentQuestion];
        const options = document.querySelectorAll('.quiz-option');
        
        // Deshabilitar todos los botones
        options.forEach(option => {
            option.disabled = true;
        });
        
        // Mostrar retroalimentación
        if (selectedIndex === question.correct) {
            options[selectedIndex].classList.add('correct');
            feedbackElement.textContent = '¡Correcto! ' + getFeedbackMessage(currentQuestion, true);
            feedbackElement.className = 'feedback-text correct';
            score++;
        } else {
            options[selectedIndex].classList.add('incorrect');
            options[question.correct].classList.add('correct');
            feedbackElement.textContent = 'Incorrecto. ' + getFeedbackMessage(currentQuestion, false);
            feedbackElement.className = 'feedback-text incorrect';
        }
        
        // Siguiente pregunta o mostrar resultados
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < quizData.length) {
                loadQuestion(currentQuestion);
            } else {
                showResults();
            }
        }, 2000);
    }
    
    // Mensajes de retroalimentación específicos
    function getFeedbackMessage(questionIndex, isCorrect) {
        const messages = {
            0: isCorrect 
                ? 'El vatio (W) es la unidad de potencia en el Sistema Internacional.' 
                : 'Recuerda que el vatio (W) es la unidad de potencia, no de corriente, resistencia o voltaje.',
            1: isCorrect
                ? '¡Exacto! El alternador es el componente que convierte la energía mecánica en eléctrica.'
                : 'El alternador es el componente correcto. El motor diésel proporciona la energía mecánica, pero no la convierte en eléctrica.',
            2: isCorrect
                ? 'Correcto. Los interruptores automáticos protegen el circuito contra sobrecargas y cortocircuitos.'
                : 'Los interruptores automáticos son los dispositivos de protección. Las barras colectoras solo distribuyen la energía.'
        };
        return messages[questionIndex] || '';
    }
    
    // Mostrar resultados finales
    function showResults() {
        const percentage = Math.round((score / quizData.length) * 100);
        let message = `¡Has completado el cuestionario! Puntuación: ${score} de ${quizData.length} (${percentage}%)`;
        
        if (percentage >= 80) {
            message += '\n¡Excelente trabajo! Tienes un gran conocimiento sobre sistemas eléctricos náuticos.';
        } else if (percentage >= 50) {
            message += '\nBuen intento. Revisa los conceptos y sigue aprendiendo.';
        } else {
            message += '\nTe recomiendo repasar los conceptos principales antes de continuar.';
        }
        
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h3>Resultados del Cuestionario</h3>
                <div class="score-display">
                    <div class="score-circle" style="--percentage: ${percentage}%;">
                        <span>${percentage}%</span>
                    </div>
                </div>
                <p>${message.split('\n').join('<br>')}</p>
                <button id="restartQuiz" class="btn btn-primary">Reintentar</button>
            </div>
        `;
        
        document.getElementById('restartQuiz').addEventListener('click', restartQuiz);
    }
    
    // Reiniciar el cuestionario
    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        loadQuestion(0);
        quizContainer.innerHTML = '';
        const quizHTML = `
            <div class="quiz-question">
                <h3></h3>
                <div class="quiz-options"></div>
            </div>
            <div class="quiz-feedback">
                <p class="feedback-text"></p>
            </div>
        `;
        quizContainer.innerHTML = quizHTML;
        loadQuestion(0);
    }
    
    // Iniciar el cuestionario
    loadQuestion(0);
});
