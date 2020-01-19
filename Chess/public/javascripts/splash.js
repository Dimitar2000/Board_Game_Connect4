var main = function() {

    var connected = false;
    var url = "http://192.168.1.22:8000/game";
    var playerName;

    var stats = document.querySelectorAll("li p");     
    var button = $("button");
    var inputName = $("input[type=text]");
    var submit = $("input[type=submit]");
    

    $.get("/statistics" , function success(data) {
        $(".Statistics").append(data);
    });

    submit.on("click", emptyInput);

    // Event Listener for the button
    button.on("click" , function() {
        
        if(connected === false) {

            connected = true;
                // Send a GET request for game.html
                document.location.href = url;

            }
    });

    function emptyInput() {

        $("button").addClass("transit").text("Play The Game");

        playerName = inputName.val();
        // Use browser cookies to save the name and later use it by game.html
        document.cookie = playerName;
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