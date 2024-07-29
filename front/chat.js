const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const startBanner = document.querySelector('.start-banner');
let isBannerHidden = false;

async function sendMessage() {
    const userMessage = userInput.value;
    if (userMessage.trim() === '') {
        return;
    }

    // Display user's message
    displayMessage(userMessage, 'user');

    // Clear the input field
    userInput.value = '';

    // Hide the start banner if it hasn't been hidden yet
    if (!isBannerHidden) {
        startBanner.classList.add('hidden');
        isBannerHidden = true;
    }

    // Send the user message to the server
    try {
        const response = await fetch('http://localhost:5000/preguntar', { // Replace with your endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pregunta: userMessage }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        const botMessage = data.respuesta || 'Sorry, I didn\'t get that.';
        
        // Display the bot's response
        displayMessage(botMessage, 'bot');

        saveChatHistory();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        // Display a default error message
        displayMessage('There was an error processing your request. Please try again later.', 'bot');

        saveChatHistory();
    }
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `${sender}_message`;

    if (sender === 'bot') {
        const botImgContainer = document.createElement('div');
        botImgContainer.className = 'bot-message-container';

        const botImg = document.createElement('img');
        botImg.className = 'bot-img';
        botImg.src = 'assetts/images/chef-svgrepo-com.png';
        botImg.alt = 'bot';

        const textElement = document.createElement('div');
        textElement.className = 'bot-text';
        //textElement.textContent = message;
        textElement.innerHTML = marked.parse(message);

        botImgContainer.appendChild(botImg);
        botImgContainer.appendChild(textElement);
        messageElement.appendChild(botImgContainer);
    } else {
        const textElement = document.createElement('div');
        textElement.textContent = message;
        messageElement.appendChild(textElement);
    }

    chatBox.appendChild(messageElement);

    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function saveChatHistory() {
    const messages = [];
    const messageElements = chatBox.querySelectorAll('.user_message, .bot_message');
    let firstUserMessage = null; // Variable para almacenar el primer mensaje del usuario

    messageElements.forEach((element, index) => {
        const sender = element.className.split('_')[0];
        const text = element.querySelector('.bot-text') ? element.querySelector('.bot-text').innerHTML : element.textContent;
        
        if (sender === 'user' && firstUserMessage === null) {
            firstUserMessage = text; // Guardar el primer mensaje del usuario
        }

        messages.push({ sender, text });
    });

    // Crear un objeto de conversación completo
    const conversation = {
        conversationId: new Date().toISOString(), // Generar un ID único para la conversación
        titulo: firstUserMessage, // Primer mensaje del usuario como título
        messages: messages,
        timestamp: new Date().toISOString()
    };

    // Guardar en localStorage
    localStorage.setItem('chatHistory', JSON.stringify(conversation));

    // Opcionalmente enviar al servidor
    try {
        await fetch('http://localhost:5000/historial', { // Reemplaza con tu endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation: conversation }),
        });
    } catch (error) {
        console.error('Failed to save chat history to the server:', error);
    }
}
