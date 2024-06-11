var username = "";
var isTeacher = false;
var isLoggedIn = false;


// JavaScript function to create a navbar
function createNavbar(loggedIn) {
    // Create the navbar container
    var navbar = document.createElement('nav');

    var html = '<nav>' +
        '    <table>' +
        '        <tr>' +
        '            <td><a href="/">Home</a></td>';

    if(loggedIn) {
        html += '<td><a href="/logout">Logout</a></td>\n';
    } else {
        html += '<td><a href="/studentlogin">Student Login</a></td><td><a href="/teacherlogin">Teacher Login</a></td>';
    }
    html += '</tr></table></nav>' ;

    navbar.innerHTML = html;

    // Append the navbar to the body
    document.body.insertBefore(navbar, document.body.firstChild);
}