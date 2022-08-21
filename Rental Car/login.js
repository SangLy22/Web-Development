$(document).ready(init);

// when the login button get clicked, call the log in function
function init(){
    $("#search-button").on("click",login);
    $("#password-input").on("keydown",function(event){maybe_login(event);});
}

// when the user presses enter in the password field, call the log in 
function maybe_login(event){
    if (event.keyCode == 13) //ENTER KEY
        login();
}

// show loading icon
// Ajax that pass in both username and password and recieve a text back
// open car.html when success
// if fail output error (invalid username or password)
function login() {
    $("#loading").attr("class","loading");
        $.ajax({
        method: "POST",
        url: "server/login_session.php",
        dataType: "text",
        data: new FormData($("#login_form")[0]),
        processData: false,
        contentType: false,
        success: function (data) {
        if($.trim(data)=="success"){
            window.location.assign("cars.html"); //redirect the page to cars.html
        }
        else{
            $("#loading").attr("class","loading_hidden"); //hide the loading icon
            $("#login_feedback").html("Invalid username or password"); //show feedback
        }
        }
    });
}