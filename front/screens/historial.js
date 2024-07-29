async function loadHistory() {
    try {
        const response = await fetch('http://localhost:5000/historial', { // Reemplaza con tu endpoint
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const history = await response.json();
        const historyContainer = document.getElementById('historyContainer');

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.conversationId; // El ID de la conversación

            historyItem.textContent = item.titulo;

            // Agregar evento de clic
            historyItem.addEventListener('click', () => {
                // Redirigir a la página de inicio con el ID de la conversación
                window.location.href = `../index.html?id=${item.conversationId}`;
            });

            historyContainer.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

loadHistory();