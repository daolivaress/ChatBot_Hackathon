async function loadConversation() {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('id');

    if (conversationId) {
      try {
        const response = await fetch(`http://localhost:5000/historial/${conversationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const conversation = await response.json();
        const chatBox = document.getElementById('chatBox');

        // Mostrar los mensajes de la conversación
        conversation.messages.forEach(msg => {
          displayMessage(msg.text, msg.sender);
        });

      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
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

    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Load conversation when the page loads
  loadConversation();