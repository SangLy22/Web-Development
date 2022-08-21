// main controller
$(document).ready(function(){
    var controller = new Controller(movies["movies"]);  // Controller 
    $("#search_button").on('click',search); // search button
    $("#field").on('keyup',search); // live search
 });
 
 // Search function
function search(){
    // Store Title, year, and Starring in array
    var names = [];
    for(var i = 0; i < movies.movies.length; i++){
        names[i] = movies.movies[i].title.bold() + '(' + movies.movies[i].year + ') ' + movies.movies[i].starring;
    }
    
    // constant
    var html = "";
    var value = $("#field").val();
    var show = false;
    
    // Loop through the array for live search
    for(var i = 0; i < names.length; i++){
        var start = names[i].toLowerCase().search(value.toLowerCase().trim());
        if(start != -1){
            html += "<div class='Movie_Search_Sub_Suggestions' data-item='" + names[i] + " ' >";
            html += names[i].substring(0,start)+"<b>"+names[i].substring(start, start+value.length)+"</b>"+names[i].substring(start+value.length,names[i].length);
            html += "</div>";  
            show = true; // set show to true when match found
        }
    }
    // shows all the matching input
    if(show){
        $("#Suggestions_Box").html(html);
        $("#Suggestions_Box").children(".Movie_Search_Sub_Suggestions").on('click',function(){
            var item = $(this).attr('data-item');
            $("#field").val(item);
            $("#Suggestions_Box").hide();
        });
        $("#Suggestions_Box").show();
    }
    else{
        $("#Suggestions_Box").hide(); // hide if input does not match
    }
}

function Controller(data) {
    this.photos = data;
    
    /*** constants ***/
    this.container_div = "#container";
    this.photos_div="#photos";
    this.grid_icon="#grid_icon";
    this.list_icon="#list_icon";
    this.combo_box="#combo_box";
    this.photo_template="#photo-template";
    this.star1 = "#star1";
    this.star2 = "#star2";
    this.star3 = "#star3";
    this.star4 = "#star4";
    this.star5 = "#star5"; 
    
    //bind some events
    var self = this; //pass a reference to controller
    var make_grid_function=function(){
        self.make_grid.call(self);
    };
    
    var make_list_function=function(){
        self.make_list.call(self);
    };
    
    var sort_photos=function(){
        self.sort_photos.call(self);
    };
    
    $(this.grid_icon).on("click", make_grid_function);
    $(this.list_icon).on("click", make_list_function);
    $(this.combo_box).on('change',sort_photos);
    
    this.load_photos();
}

// Load Photo
Controller.prototype.load_photos = function() {
    var template=$(this.photo_template).html(); //get the template
    var html_maker = new htmlMaker(template); //create an html Maker
    
    // Prime Read 
    var html = html_maker.getHTML(this.photos);
    $(this.photos_div).html(html);
     if(movies.movies[movies.movies.length - 1].HD == true){
        movies.movies[movies.movies.length-1].HD = "<img src = " + "Project_1_Images/images/HD.png"+ ">";
        $(this.photos_div).html(html);
    }
    if(movies.movies[movies.movies.length - 1].HD == false){
        movies.movies[movies.movies.length-1].HD ="";
        $(this.photos_div).html(html);
    }
    // Loop through JSON and create image
    for(var i = 0; i < movies.movies.length; i++){
        var html = html_maker.getHTML(this.photos);
        $(this.photos_div).html(html);
        // Loop through the JSON and check if HD
        // When match replace boolean with HD source image
        if(movies.movies[i].HD == true){
            movies.movies[i].HD = "<img src = " + "Project_1_Images/images/HD.png"+ ">";
        }
        if(movies.movies[i].HD == false){
            movies.movies[i].HD ="";
        }
        
        // Loop through the JSON and check for matching rating
        // display the colored star according to matched rating
        if(movies.movies[i].rating == 1){
            $(this.star1).attr("class","fa fa-star checked"); 
        }
        if(movies.movies[i].rating == 2){
            $(this.star1).attr("class","fa fa-star checked");
            $(this.star2).attr("class","fa fa-star checked");
        }
        if(movies.movies[i].rating == 3){
            $(this.star1).attr("class","fa fa-star checked");
            $(this.star2).attr("class","fa fa-star checked");
            $(this.star3).attr("class","fa fa-star checked");
        }
        if(movies.movies[i].rating == 4){
            $(this.star1).attr("class","fa fa-star checked");
            $(this.star2).attr("class","fa fa-star checked");
            $(this.star3).attr("class","fa fa-star checked");
            $(this.star4).attr("class","fa fa-star checked");
        }
        if(movies.movies[i].rating == 5){
            $(this.star1).attr("class","fa fa-star checked");
            $(this.star2).attr("class","fa fa-star checked");
            $(this.star3).attr("class","fa fa-star checked");
            $(this.star4).attr("class","fa fa-star checked");
            $(this.star5).attr("class","fa fa-star checked");
        }
    }
};

// Sort photo from least to greatest
Controller.prototype.sort_photos=function(){
    var by=$(this.combo_box).val().toLowerCase();
    this.photos=this.photos.sort(
            function(a,b){
                if(a[by]<b[by])
                    return -1;
                if(a[by]==b[by])
                    return 0;
                if(a[by]>b[by])
                    return 1;
            }            
            );
    this.load_photos();
};

// make grid when grid icon clicked
Controller.prototype.make_grid = function () {
    $(this.container_div).attr("class", "grid_container"); // use grid container when switch to grid
    $(this.photos_div).attr("class", "grid"); // switch to grid on click on grid icon
    $(this.grid_icon).attr("src", "Project_1_Images/images/grid_pressed.jpg"); // show pressed grid
    $(this.list_icon).attr("src", "Project_1_Images/images/list.jpg"); // show list
};

// make list when list icon clicked
Controller.prototype.make_list = function () {
    $(this.container_div).attr("class", "list_container"); // use list container when switch to list
    $(this.photos_div).attr("class", "list"); // switch to list on click on list icon
    $(this.grid_icon).attr("src", "Project_1_Images/images/grid.jpg"); //show grid 
    $(this.list_icon).attr("src", "Project_1_Images/images/list_pressed.jpg"); // show pressed list
};
