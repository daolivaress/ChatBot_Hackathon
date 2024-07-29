const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const startBanner = document.querySelector('.start-banner');
let isBannerHidden = false;
let conversationId = null;

// Cargar la conversación del historial si existe
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    conversationId = urlParams.get('id');

    if (conversationId) {
        await loadConversation(conversationId);
    } else {
        startBanner.classList.remove('hidden');
    }
});

// async function loadConversation(conversationId) {
//     try {
//         const response = await fetch(`http://localhost:5000/historial/${conversationId}`);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         if (data.status === 'success' && data.conversation) {
//             const conversation = data.conversation;
//             conversation.messages.forEach(message => {
//                 displayMessage(message.text, message.sender);
//             });
//             isBannerHidden = true;
//         }
//     } catch (error) {
//         console.error('Error loading conversation:', error);
//     }
// }

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
        const response = await fetch('http://localhost:5000/preguntar', {
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

        const newMessages = [
            { sender: 'user', text: userMessage, timestamp: new Date().toISOString() },
            { sender: 'bot', text: botMessage, timestamp: new Date().toISOString() }
        ];

        if (conversationId) {
            await updateConversation(conversationId, newMessages);
        } else {
            await createNewConversation(newMessages);
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        displayMessage('There was an error processing your request. Please try again later.', 'bot');
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
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function createNewConversation(newMessages) {
    const firstUserMessage = newMessages.find(msg => msg.sender === 'user').text;

    const conversation = {
        conversationId: new Date().toISOString(),
        titulo: firstUserMessage,
        messages: newMessages,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:5000/historial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversation: conversation }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.status === 'success') {
            conversationId = result.conversationId;
            localStorage.setItem('conversationId', conversationId);
        } else {
            console.error('Error creating new conversation:', result.message);
        }
    } catch (error) {
        console.error('Error creating new conversation:', error);
    }
}

async function updateConversation(conversationId, newMessages) {
    try {
        const response = await fetch(`http://localhost:5000/historial/${conversationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: newMessages }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.status === 'success') {
            // Opcionalmente actualizar la UI u otras acciones
        } else {
            console.error('Error updating conversation:', result.message);
        }
    } catch (error) {
        console.error('Error updating conversation:', error);
    }
}
