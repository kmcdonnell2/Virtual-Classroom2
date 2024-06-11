const teacherloginForm = document.getElementById("teacher-login-form");

teacherloginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    teacherlogin();
});

function teacherlogin() {
    var username = document.getElementById("username").value
    var password = document.getElementById("password").value;

    let request = {'username': username, 'password': password};

    $.ajax({
        url: '/teacherlogin',
        type: 'POST',
        contentType : 'application/json',
        data: JSON.stringify(request),
        success: function(response) {
            console.log(response);

            if(response['success']) {
                window.location.href = '/teacher';
            } else {
                alert("Incorrect user name or password.")
            }

        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });

}
