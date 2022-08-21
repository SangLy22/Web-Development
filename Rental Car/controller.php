<?php
include "sanitization.php";
session_start();
$result="";

// Main Controller
// SanitizeMYSQL    -> Block SQL injection
// Switch           -> check ajax type and call function
// Logout           -> log customer out and destroy Session
// Rented_cars      -> return customer rental car information
// Returned_cars    -> return customer returned rental car information
// Return           -> allow user to return rental car(s)
// Account name     -> retrieve customers full name
// Rent             -> allow customer to rent select car
if(isset($_POST["type"]) && is_session_active()) {
    $_SESSION['start'] = time();
    $request_type = sanitizeMYSQL($connection, $_POST['type']);
    
    switch($request_type){
        case "logout":
            logout();
            $result="success";
            break;
        case "rented_cars":
            $result = get_rented_info($connection);
            break;
        case "returned_cars":
            $result = get_returned($connection);
            break;
        case "return":
            $result = return_copy_to_history($connection, sanitizeMYSQL($connection, $_POST['return_id']));
            break;
        case "account_name":
            $result = get_username($connection);
            break;
        case "find-car":
            $result = find_car($connection);
            break;
        case "rent":
            $result = rent_this_car($connection, sanitizeMYSQL($connection, $_POST['rent_id']));
            break;
    }
}
echo $result;

// Check if session is active
function is_session_active(){
    return isset($_SESSION) && count($_SESSION) > 0 && time() < $_SESSION['start'] + 60 * 5; //check if it has been 5 minutes
}

// Rent this car
// Query        -> insert rental date, return date, rental status (1 = currently rented)
// Query        -> (2 = availble) customer id, and car id
// Check result -> if fail will send fail error, else start a second query
// Second Query -> update car table by setting car status (2 = not availble for rent)
// Check Second result, return success if sql ran successfully
function rent_this_car($connection, $rent_id) {
    $query =" INSERT INTO Rental (rentDate, returnDate, status, CustomerID, CarID)"
            ." VALUE (now(), null, '1' ,'".$_SESSION["username"]."', '".$rent_id."')";
            
    $result = mysqli_query($connection, $query);
    if(!$result){
        return "fail";
    }
    else{
        $query = "UPDATE Car"
                ." SET Status = '2'"
                ." WHERE Car.ID = '".$rent_id."'";
        $result = mysqli_query($connection, $query);
        if(!$result){
            return "fail";
        }
        else {return "success";}
    }
}

// Update user car rental return information
// Query        -> update rental, setting return date to current date and status
// Query        -> (2 = customer returned rental car)
// Check result -> if fail return fail, else create another query
// Second Query -> update the car status to become available (1 = availble)
// Check second result and return success if sql ran successfully
function return_copy_to_history($connection, $return_id){
    $query = "UPDATE Rental"
            ." SET returnDate = now(), status = '2'"
            ." WHERE Rental.CustomerID = '".$_SESSION["username"]."'" 
            ." AND Rental.ID = '".$return_id."'";
    
    $result = mysqli_query($connection, $query);
    if(!result){
        return "fail";
    }
    else{
        $query = "UPDATE Car"
                ." INNER JOIN Rental"
                ." ON Rental.carID = Car.ID"
                ." SET car.status = '1'"
                ." WHERE Rental.ID = '".$return_id."'";
        
        $result = mysqli_query($connection, $query);
        if(!result){return "fail";}
        else {return "success";}
    }
}

// Get the customer rented information
// Query        -> select car specs, model, size, year made, rental date, car picture and picture type
// Query        -> use inner join to join customer, rental, car and car specs
// Query        -> check return date is null and customer id is the same as user's session
// Result       -> send query to database with connection and return empty json if fail
// Result       -> else stored the selected data into a json and send back to ajax
function get_rented_info($connection){
    // assign variable
    $final = array();
    $final["rented_car"] = array();
 
    $query = "SELECT Carspecs.Make, Carspecs.Model, Carspecs.Size,"
            ." Rental.rentDate, Car.Picture, Car.Picture_type, Rental.ID, Carspecs.YearMade"
            ." FROM Customer"
            ." INNER JOIN Rental"
            ." ON Customer.ID = Rental.CustomerID"
            ." INNER JOIN Car"
            ." ON Car.ID = Rental.CarID"
            ." INNER JOIN CarSpecs"
            ." ON CarSpecs.ID = Car.CarSpecsID"
            ." WHERE Rental.returnDate IS NULL AND Rental.CustomerID = '".$_SESSION["username"]."'";

    $result = mysqli_query($connection, $query);
    if(!$result){
        return json_encode($array);
    }
    else {
        $row_count = mysqli_num_rows($result);
        for($i = 0; $i < $row_count; $i++){
            $row = mysqli_fetch_array($result);
            $array = array();
            $array["picture"] = 'data:' . $row["Picture_Type"] . ';base64,' . base64_encode($row["Picture"]);
            $array["make"] = $row["Make"];
            $array["model"] = $row["Model"];
            $array["year"] = $row["YearMade"];
            $array["size"] = $row["Size"];
            $array["rental_ID"] = $row["ID"];
            $array["rent_date"] = $row["rentDate"];
            $final["rented_car"][] = $array;
        }
    }
    return json_encode($final);
}

// Get customer return rental information
// Query        -> select car specs make, model, size, year made, rental return date, car picture and picture type
// Result       -> send query to database with connection and return empty json if fail
// Result       -> else stored the selected data into a json and send back to ajax
function get_returned($connection){
    // assign variable
    $final = array();
    $final["returned_car"] = array();
    
    $query = "SELECT Carspecs.Make, Carspecs.Model, Carspecs.Size,"
            ." Rental.returnDate, Car.Picture, Car.Picture_type, Rental.ID, Carspecs.YearMade"
            ." FROM Customer"
            ." INNER JOIN Rental"
            ." ON Customer.ID = Rental.CustomerID"
            ." INNER JOIN Car"
            ." ON Car.ID = Rental.CarID"
            ." INNER JOIN CarSpecs"
            ." ON CarSpecs.ID = Car.CarSpecsID"
            ." WHERE Rental.returnDate IS NOT NULL AND Rental.CustomerID = '".$_SESSION["username"]."'";
    
    $result = mysqli_query($connection, $query);
    if(!$result){
        return json_encode($final);
    }
    else { // if success store database information in json array 
        // store: Picture, Make, Model, Year, Size, Rental id, return rental date
        $row_count = mysqli_num_rows($result);
        for($i = 0; $i < $row_count; $i++){
            $row = mysqli_fetch_array($result);
            $array = array();
            $array["picture"] = 'data:' . $row["Picture_Type"] . ';base64,' . base64_encode($row["Picture"]);
            $array["make"] = $row["Make"];
            $array["model"] = $row["Model"];
            $array["year"] = $row["YearMade"];
            $array["size"] = $row["Size"];
            $array["rental_ID"] = $row["ID"];
            $array["return_date"] = $row["returnDate"];
            $final["returned_car"][] = $array;
        }
    }
    return json_encode($final);
}

// Find car
// Isset        -> get the search box and remove white spaces (using trim)
// Sanitize     -> sanitize the search box (prevent SQL injection)
// Query        -> select car specs make, model, size, year made, car color, id, picture and picture type
// Result       -> send connection and query to database, return a empty json if fail
// Result       -> else put selected data into json and send back to ajax
function find_car($connection){
    // assign variable
    $final = array();
    $final["car"] = array();
    
    if(isset($_POST['search']) && trim($_POST['search']) != "") {   
        $request = trim(sanitizeMYSQL($connection, $_POST['search']));
        $query = "SELECT CarSpecs.Make, CarSpecs.Model, Carspecs.Size, Car.Color,"
                ." Car.Picture, Car.Picture_type, Carspecs.YearMade, car.ID"
                ." FROM Car"
                ." INNER JOIN CarSpecs"
                ." ON CarSpecs.ID = Car.CarspecsID"
                ." WHERE (CarSpecs.Make LIKE '%".$request."%'"
                ." OR CarSpecs.Model LIKE '%".$request."%'"
                ." OR Carspecs.Size LIKE '%".$request."%'"
                ." OR Carspecs.YearMade LIKE '%".$request."%'"
                ." OR Car.Color LIKE '%".$request."%')"
                ." AND Car.Status = '1'";

        $result = mysqli_query($connection, $query);
        if(!$result){
            return json_encode($final);
        }
        else { // if success store database information in json array 
            // store: Picture, Make, Model, Year, Size, Rental id, return rental date
            $row_count = mysqli_num_rows($result);
            for($i = 0; $i < $row_count; $i++){
                $row = mysqli_fetch_array($result);
                $array = array();
                $array["picture"] = 'data:' . $row["Picture_Type"] . ';base64,' . base64_encode($row["Picture"]);
                $array["make"] = $row["Make"];
                $array["model"] = $row["Model"];
                $array["year"] = $row["YearMade"];
                $array["color"] = $row["Color"];
                $array["size"] = $row["Size"];
                $array["ID"] = $row["ID"];
                $final["car"][] = $array;
            }
        }
    }
    return json_encode($final);
}

function logout() {
    // Unset all of the session variables.
    $_SESSION = array();

    // If it's desired to kill the session, also delete the session cookie.
    // Note: This will destroy the session, and not just the session data!
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]
        );
    }

    // Finally, destroy the session.
    session_destroy();
}

// Get customer full name
function get_username($connection) {
    // create query to retrieve customer name
    $query = "SELECT Name"
            ." FROM Customer"
            ." WHERE ID='".$_SESSION["username"]."'";
    
    // send to database
    $result = mysqli_query($connection, $query);
    
    // store database information in a temp variable to send back to js
    $row = mysqli_fetch_assoc($result);
    $temp = $row["Name"];
    return $temp;
}

?>

