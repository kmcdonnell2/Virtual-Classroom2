var socket = io.connect('http://' + document.domain + ':' + location.port);

var username = "";
var isTeacher = false;

socket.on('announcement', function(msg) {
    addItem('announcement-list', msg);
});

socket.on('message', function(data) {
    var user = data['to'];
    var message = data['message'];
    if(username !== user)
        return;

    var chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += getCurrentTime() + " teacher: " + message + "\n";
});

window.onload = function() {
    console.log('Page loaded!');

    var usernameInput = document.getElementById("username");
    username = usernameInput.value;

    isTeacher = false;
    isloggedIn = false;

    console.log("Welcome " + username);
};

function sendQuestion() {
    var questionInput = document.getElementById('question-input');
    var question = questionInput.value;
    var username = document.getElementById('username').value;

    socket.emit("question", {'sender': username, "question": question});

    questionInput.value = '';

    console.log("Question: " + question);
    addItem('question-list', question);
}

socket.on('endquestion', function(data) {
    var user = data['to'];
    if(username !== user)
        return;

    var question = data['question'];
    console.log("Remove question: " + question);
    removeItem('question-list', question);
});


function handleFeedbackChange(selectedRadioButton) {
    // You can perform actions based on the selected radio button
    console.log('Selected status:', selectedRadioButton.value);
    socket.emit("feedback", {'sender': username, "value": selectedRadioButton.value});
}

function hallPassRequest() {
    var selectedOption = document.querySelector('input[name="hallpass"]:checked');

    if (!selectedOption) {
        alert("Please select an option.");
        return;
    }

    var destination = selectedOption.value;
    var time = getCurrentTime();

    console.log(username + "\t" + destination);
    socket.emit("hallpassrequest", {'sender': username, 'status' : 'request', 'destination' : destination, 'time': time});

    addItem("hall-pass-list", "Requested: " + destination + " " + time);

    hideHallPassOptions(false);
    var hallPassCancelButton = document.getElementById("hall-pass-cancel-button");
    hallPassCancelButton.hidden = false;
}


function hallPassCancel() {
    var time = getCurrentTime();
    addItem("hall-pass-list", "Canceled " + time);

    socket.emit("hallpassrequest", {'sender': username,'status' : 'cancel', 'time': time});

    hideHallPassOptions(true);
}

function hallPassEnd() {
    var time = getCurrentTime();
    addItem("hall-pass-list", "Ended " + time);

    socket.emit("hallpassrequest", {'sender': username,'status' : 'end', 'time': time});

    hideHallPassOptions(true);
}

socket.on('hallpassupdate', function(data) {
    var user = data['to'];
    if(username !== user)
        return;

    var status = data['status'];
    console.log("hallpassupdate: " + status);

    if (status.includes('grant')) {
        addItem('hall-pass-list', "Granted " + getCurrentTime());

        hideHallPassOptions(false);
        var hallPassEndButton = document.getElementById("hall-pass-end-button");
        hallPassEndButton.hidden = false;

        alert("Hall pass granted!");
    } else if (status.includes('dismiss')) {
        addItem('hall-pass-list', "Dismissed " + getCurrentTime());
        hideHallPassOptions(true);
    } else if (status.includes('end')) {
        addItem('hall-pass-list', "Ended " + getCurrentTime());
        hideHallPassOptions(true);
    }
});

function hideHallPassOptions(showRequest = true) {
    var hallPassRequestDiv = document.getElementById("hall-pass-request");
    var hallPassStatusDiv = document.getElementById("hall-pass-status");
    var hallPassCancelButton = document.getElementById("hall-pass-cancel-button");
    var hallPassEndButton = document.getElementById("hall-pass-end-button");

    if (showRequest) {
        hallPassRequestDiv.style.display = "block";
        hallPassStatusDiv.style.display = "none";
        hallPassCancelButton.hidden = true;
        hallPassEndButton.hidden = true;
    } else {
        hallPassRequestDiv.style.display = "none";
        hallPassStatusDiv.style.display = "block";
        hallPassCancelButton.hidden = true;
        hallPassEndButton.hidden = true;
    }
}

function sendMessageToTeacher() {
    var messageBox = document.getElementById("chat-message-input");
    var chatBox = document.getElementById("chat-box");

    var message = messageBox.value;
    console.log(username + "\t" + message);

    chatBox.innerHTML += getCurrentTime() + " " + username + ": " + message + "\n";

    socket.emit("messageToTeacher", {'sender': username, 'message' : message});
}