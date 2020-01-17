
var main = function () {

    const connect4 = new Connect4('#connect4');

    var id;
    var game_id;
    var player2Name;

        
    var wss = new WebSocket("ws://localhost:8000/");
    connect4.addSocket(wss);

    wss.onopen = function (ws, event) {
       let initialRequest = {
           reason: "New Player"
       }
        wss.send(JSON.stringify(initialRequest));
    };

        wss.onmessage = ((event) => {               

            var message = JSON.parse(event.data);
            
            switch (message.reason) {

                case "Game_Start": gameInitialization(message); break;

                case "Move": makeMove(message.filled_cell); break;  

                case "DRAW": draw(); break;

                case "GAMEOVER": Game_Over(); break;
                
            }
            
        });

    function gameInitialization(message) {
        game_id = message.game_id;
        id = message.id;
        player2Name = message.player2Name;
    }

        // Inform the player that he has lost the game and close he connection with the server
        function Game_Over() {
            wss.close();
            alert("You lose. Very sorry.");
        };

        // Redirect to the makeMove() function of the connect4
        function makeMove(coordinates) {
            connect4.makeMove(coordinates);
        }

        
    }



$(document).ready(main);