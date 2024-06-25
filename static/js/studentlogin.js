const studentloginForm = document.getElementById("student-login-form");

studentloginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    studentlogin();
});

function studentlogin() {
    var username = document.getElementById("username").value;

    let request = {'username': username};

    $.ajax({
        url: '/studentlogin',
        type: 'POST',
        contentType : 'application/json',
        data: JSON.stringify(request),
        success: function(response) {
            console.log(response);

            if(response['success']) {
                window.location.href = '/student';
            } else {
                alert(response['message'])
            }

        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });

}
