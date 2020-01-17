var main = function() {


   // var client = new WebSocket("ws://localhost:3000");  // We create a new WebSocket object that instantly connects to the server
    
    var connected = false;
    var url = "http://localhost:8000/game";
    var playerName;

    var stats = document.querySelectorAll("li p");   // We create an array to hold the places where our statistics are located on the page   
    var button = $("button");
    var inputName = $("input[type=text]");
    var submit = $("input[type=submit]");

    submit.on("click", emptyInput);

    // Event Listener for the button
    button.on("click" , function() {
        
        if(connected === false) {

            connected = true;
            displayWaiting(this);

            $.ajax({
                type: "POST",
                url: url,
                data: player
            })

            setTimeout(function () {
                // Send a GET request for game.html
                window.location.href = url;
            }, 2000);
            
        }

    });

    function emptyInput() {
        playerName = inputName.val();
        // Use browser cookies to save the name and later use it by game.html
        inputName.attr("disabled", "disabled");
        inputName.val("");
        console.log(playerName + " " + submit);
        button.attr("disabled", false);
    }


    function displayWaiting(button) {

        $(button).text("Waiting for Player 2");
 
        let count = 1;
        let initial = $(button).text();
        let bt = button;
        setInterval(function () {

            let current = $(bt).text();
            if (count > 0) current = current + " .";
            else current = initial;
            if (count != 3) count++;
            else count = 0;
            $(bt).text(current);

        }, 1000);

    }
};

$(document).ready(main);