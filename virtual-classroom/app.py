from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from flask_socketio import SocketIO

import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(16).hex()
socketio = SocketIO(app)


student_list = []
numStudents = 0

@app.route('/')
@app.route('/index')
@app.route('/home')
def home():  # put application's code here
    session['is_logged_in'] = False
    session['username'] = ''
    return render_template('index.html')

@app.route('/login')
@app.route('/studentlogin', methods=['GET'])
def studentlanding():  # put application's code here
    if 'is_logged_in' in session.keys() and session['is_logged_in'] and not session['is_teacher']:
        return redirect(url_for('student'))

    session['is_logged_in'] = False
    session['username'] = ''
    session['message'] = ''
    session['is_teacher'] = False

    return render_template('studentlogin.html')

@app.route('/studentlogin', methods=['POST'])
def studentlogin():
    if 'is_logged_in' in session.keys() and session['is_logged_in'] and not session['is_teacher']:
        return redirect(url_for('student'))

    response = dict()
    response['success'] = False

    username = request.json['username']

    if 'username' in request.json.keys() and len(request.json['username']) >= 2:
        if username not in student_list:
            session['is_logged_in'] = True
            session['username'] = username
            session['is_teacher'] = False

            student_list.append(username)

            socketio.emit("studentjoin", username);

            response['success'] = True
        else:
            response['message'] = "Please use a unique user name."
    else:
        response['message'] = "Please include your name longer than 2 letters."

    return jsonify(response)

@app.route('/student')
def student():
    if 'is_logged_in' not in session.keys() or 'is_logged_in' in session.keys() and not session['is_logged_in']:
        session['message'] = 'You have been logged out!'
        return redirect(url_for('studentlogin'))

    return render_template('student.html')

@app.route('/teacherlogin', methods=['GET'])
def teacherlanding():
    if 'is_logged_in' in session.keys() and session['is_logged_in']:
        return redirect(url_for('teacher'))

    session['is_logged_in'] = False
    session['username'] = ''
    session['message'] = ''
    session['is_teacher'] = False

    return render_template('teacherlogin.html')

@app.route('/teacherlogin', methods=['POST'])
def teacherlogin():  # put application's code here
    print(request.json)

    response = dict()
    response['success'] = False

    print(student_list)

    if 'is_logged_in' in session.keys() and session['is_logged_in']:
        return redirect(url_for('teacher'))

    if 'username' in request.json.keys() and 'password' in request.json.keys():
        if len(request.json['username']) >= 4 and request.json['password'] == 'password':
            session['is_logged_in'] = True
            session['is_teacher'] = True
            session['username'] = request.json['username']
            response['success'] = True

            session['student_list'] = student_list
        else:
            session['message'] = "Incorrect username or password."

    return jsonify(response)

@app.route('/teacher')
def teacher():  # put application's code here
    if 'is_logged_in' not in session.keys() or 'is_logged_in' in session.keys() and not session['is_logged_in']:
        session['message'] = 'You have been logged out!'
        return redirect(url_for('teacherlogin'))

    session['message'] = student_list
    return render_template('teacher.html')

@app.route('/logout')
def logout():
    url = "teacherlogin"

    if not session['is_teacher']:
        student_list.remove(session['username'])
        url = "studentlogin"
        socketio.emit("studentleave", session['username'])

    session['is_logged_in'] = False
    session['username'] = ''
    session['message'] = "You have been logged out."

    return redirect(url_for(url))

@socketio.on('message')
def handle_message(data):
    print('Message:', data)
    socketio.emit('message', data)

@socketio.on("announcement")
def handle_announcement(msg):
    print('Announcement:', msg)
    socketio.emit('announcement', msg)

@socketio.on("question")
def handle_question(msg):
    print('Question:', msg)
    socketio.emit('question', msg)

@socketio.on("feedback")
def handle_feedback(msg):
    print('Feedback:', msg)
    socketio.emit('feedback', msg)

@socketio.on("studentjoin")
def handle_studentjoin(msg):
    print('studentjoin:', msg)
    socketio.emit("studentjoin", msg)

@socketio.on("studentleave")
def handle_studentleave(msg):
    print('studentleave:', msg)
    socketio.emit('studentleave', msg)

@socketio.on("endquestion")
def handle_endquestion(data):
    print('endquestion:', data)
    socketio.emit('endquestion', data)

@socketio.on("hallpassrequest")
def handle_hallpassrequest(data):
    print('hallpassrequest:', data)
    socketio.emit('hallpassrequest', data)

@socketio.on("hallpassupdate")
def handle_hallpassupdate(data):
    print('hallpassupdate:', data)
    socketio.emit('hallpassupdate', data)

@socketio.on("messageToTeacher")
def handle_messageToTeacher(data):
    print("messageToTeacher", data)
    socketio.emit('messageToTeacher', data)

if __name__ == '__main__':
    #app.run()
    socketio.run(app)
