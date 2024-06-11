function displayMessage(sender, message) {
    var chatMessages = document.getElementById('chat-messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateTabs(users) {
    var chatTabs = document.getElementById('chat-tabs');
    chatTabs.innerHTML = ''; // Clear existing tabs

    users.forEach(function(user) {
        var tabDiv = document.createElement('div');
        tabDiv.className = 'chat-tab';
        tabDiv.textContent = user;
        tabDiv.onclick = function() {
            switchTab(user);
        };
        chatTabs.appendChild(tabDiv);
    });
}

function switchTab(room) {
    socket.emit('switch_tab', { room: room });
}
