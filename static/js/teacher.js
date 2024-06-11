var socket = io.connect('http://' + document.domain + ':' + location.port);

var isTeacher = false;
var studentList = [];
var studentListInput;
var showingHallPassLog = false;

var chatMessages = new Map();

window.onload = function() {
    console.log('Page loaded!');
    isTeacher = true;
    username = "teacher"

    console.log("Welcome, teacher!");

    studentListInput = document.getElementById("student-list-input");
    var preStudentList = studentListInput.value;

    if (preStudentList.length > 2){
        preStudentList = preStudentList.replaceAll('\'', "").replaceAll('[', "").replaceAll(']', "").replaceAll(' ', "")
        var preStudents = preStudentList.split(",")
        for (var i = 0; i < preStudents.length; i++){
            addStudent(preStudents[i]);
            if(!chatMessages.has(preStudents[i]))
                chatMessages.set(preStudents[i], "");
        }
        console.log(studentList);
    }
};

function sendAnnouncement() {
    var announcementInput = document.getElementById('announcement-input');
    var announcement = announcementInput.value;
    var time = getCurrentTime();
    socket.emit("announcement", announcement + " " + time);
    announcementInput.value = '';
}

socket.on('announcement', function(msg) {
    addItem('announcement-list', msg);
});

socket.on('studentjoin', function(student) {
    addStudent(student);
});

function addStudent(student) {
    studentList.push(student);
    //addItem('student-list', student);
    addItem('good-list', student + " ");
    addStudentRadioButton(student);
    studentListInput.value = studentList;
    chatMessages.set(student, "");
}

socket.on('studentleave', function(student) {
    var i = studentList.indexOf(student);
    studentList.splice(i, 1);

    console.log(studentList);
    removeItem('student-list', student, true);
});

socket.on('feedback', function(data) {
    var time = getCurrentTime();

    var student = data['sender'];
    var feedback = data['value'];

    console.log(student + "\t" + feedback)

    if(feedback.includes('stuck')){
        addItem('stuck-list', student + " " + time);
        removeItem('slow-list', student + " ");
        removeItem('good-list', student + " ");
    } else if(feedback.includes('slow')){
        addItem('slow-list', student + " " + time);
        removeItem('stuck-list', student + " ");
        removeItem('good-list', student + " ");
    } else {
        addItem('good-list', student + " " + time)
        removeItem('slow-list', student + " ");
        removeItem('stuck-list', student + " ");
    }
});

socket.on('question', function(data) {
    console.log(JSON.stringify(data));
    var user = data['sender'];
    var msg = data['question'];
    var time = getCurrentTime();

    var text = user + ": " + msg + " " + time;

    var li = addItem('question-list', text);
    var button = addRemoveQuestionButton('question-list', user, msg);
    li.appendChild(button);
});

function addRemoveQuestionButton(list, user, question) {
    var button = document.createElement("button");
    button.type = "button";
    button.innerHTML = "Remove";

    button.addEventListener("click", function() {
        console.log("Removing question: " + user + "\t" + question);
        removeItem(list, question);
        socket.emit("endquestion", {"to":user, "question":question});
    });
    return button;
}

function sendMessageToStudent() {
    var selectedOption = document.querySelector('input[name="students"]:checked');
    var messageBox = document.getElementById("chat-message-input");
    var chatBox = document.getElementById("chat-box");

    if (selectedOption) {
        var student = selectedOption.value;
        var message = messageBox.value;
        console.log(student + "\t" + message);

        var output = getCurrentTime() + " me: " + message + "\n";


        if (chatMessages.has(student)) {
            output = chatMessages.get(student) + output;
        }
        chatMessages.set(student, output);
        chatBox.innerHTML = chatMessages.get(student);

        socket.emit("message", {'to': student, 'message' : message});
    } else {
        alert("Please select an option.")
    }
}

socket.on('messageToTeacher', function(data) {
    var student = data['sender'];
    var message = data['message'];
    var chatBox = document.getElementById("chat-box");

    var output = getCurrentTime() + " " + student + ": " + message + "\n";

    if (chatMessages.has(student)) {
        output = chatMessages.get(student) + output;
    }
    chatMessages.set(student, output);

    selectStudent(student);

    chatBox.innerHTML = chatMessages.get(student);

});

function selectStudent(value) {
    var radioButtons = document.getElementsByName('students');

    // Loop through radio buttons to find the one with the matching value
    radioButtons.forEach(function(radio) {
        if (radio.value === value) {
            // Set the 'checked' property to true for the matching radio button
            radio.checked = true;
        }
    });
}

function handleStudentChange(student) {
    // You can perform actions based on the selected radio button
    console.log('Selected student:', student);
    var chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = chatMessages.get(student);
}
function addStudentRadioButton(student) {
    var container = document.getElementById("studentRadioContainer");

    var radioButton = document.createElement("input");
    radioButton.type = "radio";
    radioButton.name = "students"; // Set the same name for all radio buttons in the group
    radioButton.value = '' + student;
    radioButton.checked = true;

    radioButton.addEventListener('change', function() {
       handleStudentChange(radioButton.value);
    });

    // Create label for the radio button
    var label = document.createElement("label");
    label.appendChild(radioButton);
    label.appendChild(document.createTextNode(student));

    // Add radio button and label to the container
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
}

socket.on('hallpassrequest', function(data) {
    var hallPassLog = document.getElementById('hall-pass-log');

    var student = data['sender'];
    var status = data['status'];
    var destination = data['destination'];
    var time = getCurrentTime();

    console.log("hallpass: " + student + " " +status + " " + time);

    if(destination) {
        hallPassLog.innerHTML +=  student + " " +status + " " + destination + " " + time + "\n";
    } else {
        hallPassLog.innerHTML +=  student + " " +status + " " + time + "\n";
    }



    if(status.includes('request')) {
        var message = student + ": " + destination  + " - Requested "+ " " + time;
        addStudentToHallPass(student, message);
    } else if (status.includes("cancel")) {
        removeItem('hall-pass-list', student);
    } else if (status.includes("end")) {
        removeItem('hall-pass-list', student);
    }


});

function addStudentToHallPass(student, message) {
    var tab = document.createTextNode("\t")

    var li = addItem('hall-pass-list', message);
    li.appendChild(tab);
    var button1 = addHallPassButton('hall-pass-list', student, 'grant');
    li.appendChild(button1);
    li.appendChild(tab);
    var button2 = addHallPassButton('hall-pass-list', student, 'dismiss');
    li.appendChild(button2);
}

function addHallPassButton(list, user, status) {
    var hallPassLog = document.getElementById('hall-pass-log');

    var button = document.createElement("button");
    button.type = "button";
    button.innerHTML = status;

    button.addEventListener("click", function() {
        console.log("Hall pass update: " + user + "\t" + status);
        hallPassLog.innerHTML +=  user + " " + status + " " + getCurrentTime() + "\n";
        socket.emit("hallpassupdate", {"to":user, "status":status});

        if (status.includes("grant")) {
            grantHallPass(user);
        } else {
            removeItem('hall-pass-list', user);
        }
    });
    return button;
}

function grantHallPass(student) {
    var ulId = 'hall-pass-list';
    var ul = document.getElementById(ulId);

    for (var i = 0; i < ul.children.length; i++){
        if (ul.children[i].textContent.includes(student)) {
            var li = ul.children[i];

            li.innerText = li.innerText.replaceAll("Requested", "Granted").replaceAll("grant","").replaceAll("dismiss","").trim();

            var button1 = addHallPassButton('hall-pass-list', student, 'end');
            li.appendChild(button1);
            var button2 = addHallPassButton('hall-pass-list', student, 'dismiss');
            li.appendChild(button2);


            return;
        }
    }

    console.log("Could not remove " + student + " from " + ulId);
}

function showHallPassLog(){
    var button = document.getElementById("showHallPassLogButton");
    var hallPassLogDiv = document.getElementById("hall-pass-log");

    showingHallPassLog = !showingHallPassLog;

    if (showingHallPassLog){
        hallPassLogDiv.style.display = "block";
        button.innerText = "Hide Hall Pass Log";
    } else {
        hallPassLogDiv.style.display = "none";
        button.innerText = "Show Hall Pass Log";
    }
}