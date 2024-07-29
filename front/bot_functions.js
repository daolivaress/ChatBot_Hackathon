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

// Function to speak the message
function speakMessage(element) {
    // Get the message text
    const message = element.closest('.bot_message').querySelector('p').textContent;

    // Create a new instance of SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(message);

    // Use the speechSynthesis API to speak the message
    window.speechSynthesis.speak(utterance);
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
