//var socket = io.connect('https://' + document.domain + ':' + location.port);
var socket = io.connect('wss://virtual-classroom-5f0a6adbc3d6.herokuapp.com/');

socket.on('message', function(msg) {
    if(msg.includes("announcement")) {
        var index = msg.lastIndexOf(";") + 1;
        handleAnnouncement(msg.substring(index));
    }

    if (isTeacher && msg.startsWith("teacher")) {
        handleTeacherMessage(msg);
    } else if (!isTeacher && msg.startsWith(username)) {
        handleStudentMessage(msg);
    }
});

function sendMessage(to, from, type, message) {
    var currentTime = getCurrentTime();

    var msg = to + ";" + from + ";" + type + ";" + message + currentTime;
    console.log("Sending Message: " + msg);
    socket.emit('message', msg);
}



function handleAnnouncement(msg){
    addItem('announcement-list', msg);
}



function handleChatMessage(msg){
    var chatMessages = document.getElementById('chat-messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.appendChild(document.createTextNode(msg));
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    var chatInput = document.getElementById('chat-input');
    var chat = chatInput.value;

    console.log("Chat: " + chat);

    if (chat.trim() !== '') {
        socket.emit('message', chat);
        chatInput.value = '';
    }
}
