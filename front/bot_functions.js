// Función para pre-cargar voces
function preloadVoices() {
    if ('speechSynthesis' in window) {
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
            };
        }
    }
}

// Función para que el icono lea el mensaje en voz alta
function speakMessage(element) {
    const message = element.closest('.bot_message').querySelector('p').textContent;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'es-ES'; // Configura el idioma según tus necesidades
    window.speechSynthesis.speak(speech);
}

// Función para que el icono copie el mensaje al portapapeles
function copyMessage(element) {
    const message = element.closest('.bot_message').querySelector('p').textContent;
    navigator.clipboard.writeText(message).then(() => {
        alert('Mensaje copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el texto: ', err);
    });
}

// Añadir eventos a los iconos cuando el documento está cargado
document.addEventListener('DOMContentLoaded', () => {
    preloadVoices();

    document.querySelectorAll('.icon-sound-alt').forEach(icon => {
        icon.addEventListener('click', () => speakMessage(icon));
    });

    document.querySelectorAll('.icon-content_copy').forEach(icon => {
        icon.addEventListener('click', () => copyMessage(icon));
    });
});
