var main = function() {

   // var client = new WebSocket("ws://localhost:3000");  // We create a new WebSocket object that instantly connects to the server
    var stats = document.querySelectorAll("li p");   // We create an array to hold the places where our statistics are located on the page
    var button = $("button");
    var connected = false;

    // Event List ener for the button
    button.on("click" , function() {

        if(connected === false) {
            connected = true;
            $(this).text("Waiting for Player 2");
            // Send a message "Connecting " , Being reconnected to the game.html
            // Receive my own ID and save it as constant. Send it with every other message
            let count = 1;
            let initial = $(this).text();
            let bt = this;
            setInterval(function() {

                        let current = $(bt).text();
                        if(count > 0) current = current + " .";
                        else current = initial;
                        if(count != 3) count++;
                        else count = 0;
                        $(bt).text(current);

                } , 1000 );

        }

    
    });


};

$(document).ready(main);