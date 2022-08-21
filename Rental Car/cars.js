$(document).ready(init);
// Call when ready
function init() {
    $("#logout-link").on("click", logout);
    show_account_name();
    
    $("#find-car").on("click", find_car);
    $("#find-car-input").on("keydown", function(event){find_car_key(event);});
    show_rented_car();
    show_rented_history();
}

// when user presses enter in the password field and called find car
function find_car_key(event){
    if(event.keyCode == 13){
        find_car();
    }
}

// Ajax 
// send in type     -> rented_cars
// recieved type    -> in json format
// success          -> create template and handle button when click
function show_rented_car(){
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "json",
        data: {type: "rented_cars"},
        success: function(data){
            var info_template=$("#rented-car-template").html();
            var html_maker=new htmlMaker(info_template);
            var html=html_maker.getHTML(data);
            $("#rented_cars").html(html);
            // when return car button get click call return car function
            $("div[name=return-car-button]").on("click",function(){return_car(this);});
        }
    });
}

// Ajax
// send in type, id -> return and also id return 
// recieved type    -> in text format
// success          -> alert car has returned when success and show rented car, rented history, and find car
function return_car(return_button){
    var return_id = $(return_button).attr("data-rental-id");
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "text",
        data: {type: "return", return_id:return_id},
        success: function(data){
            if($.trim(data)=="success"){
                alert("Car has been returned successfully");
                show_rented_car();
                show_rented_history();
                find_car();
            }
        }
    });
}

// Ajax
// send in type     -> returned cars
// recieved type    -> in json format
// success          -> create template when json data send back
function show_rented_history(){
    $.ajax({
       method: "POST",
       url: "server/controller.php",
       dataType: "json",
       data: {type: "returned_cars"},
       success: function(data){
           var info_template=$("#returned-car-template").html();
            var html_maker=new htmlMaker(info_template);
            var html=html_maker.getHTML(data);
            $("#returned_cars").html(html);
       }
    });
}

// Ajax
// send in type     -> rented_cars
// recieved type    -> in json format
// success          -> create template and handle button when click
function find_car(){
    $("#loading").attr("class","loading");
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "json",
        data: {search: $("#find-car-input").val(), type: "find-car"},
        success: function(data){
            $("#loading").attr("class","loading_hidden");
            var info_template=$("#find-car-template").html();
            var html_maker=new htmlMaker(info_template);
            var html=html_maker.getHTML(data);
            $("#search_results").html(html);
            // when rent car button get click call rent car function
            $("div[name=rent-car-button]").on("click",function(){rent_car(this);});
        }
    });
}

// Ajax
// send in type, id -> rent and pas in id rent id
// recieved type    -> in text format
// success          -> alert when car is successfully rented
function rent_car(rent_button){
    var rent_id = $(rent_button).attr("data-rent-id");
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "text",
        data: {type: "rent", rent_id:rent_id},
        success: function(data){
            if($.trim(data)=="success"){
                alert("Car has been rented successfully");
                show_rented_car();
                find_car();
            }
        }
    });
}

// Ajax
// send in type     -> log out
// recieved type    -> in text format
// success          -> display the log in page
function logout(){
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "text",
        data: {type: "logout"},
        success: function(data){
            if($.trim(data)=="success"){
                window.location.assign("login.html");
            }
        }
    });
}

// Ajax
// send in type     -> account name
// recieved type    -> in text format
// success          -> display the user full name in html heading
function show_account_name(){
    $.ajax({
        method: "POST",
        url: "server/controller.php",
        dataType: "text",
        data: {type: "account_name"},
        success: function(data){   
            $('a#username').html(data);
        }
    });
}
