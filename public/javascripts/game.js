
var main = function () {


    /*     -------------------------------------------------------------   */
    /*       Create a game object and pass him the WebSocket instance      */
    const connect4 = new Connect4('#connect4');
    var wss = new WebSocket("ws://192.168.1.22:8000/");
    connect4.addSocket(wss);
    /*     -------------------------------------------------------------   */

    wss.onopen = function (ws, event) {

        let initialRequest = {
            reason: "New Player"
        }

        wss.send(JSON.stringify(initialRequest));

    };

    wss.onmessage = ((event) => {

        var message = JSON.parse(event.data);
        console.log(message);

        switch (message.reason) {

            case "Game_Start": gameInitialization(message); break;

            case "Move": makeMove(message.filled_cell); break;

            case "DRAW": draw(); break;

            case "GAMEOVER": Game_Over(); break;

        }

    });

    function gameInitialization(message) {

        connect4.id = message.my_id;
        connect4.game_id = message.game_id;
        connect4.myMove = message.myMove;
        connect4.player2Name = message.player2Name;
        connect4.displayWaitingMove();
        console.log(connect4);
        startCount();

    }

    // Inform the player that he has lost the game and close the WebSocket
    function Game_Over() {
        wss.close();
        document.querySelector("audio#loser").play().then((result) => {
            document.querySelector("audio#loser").play();
        }).catch((err) => {

        });;
        alert("You lose. Very sorry.");
    };

    // Redirect to the makeMove() function of the connect4 that will fill the enemy's cell
    function makeMove(coordinates) {
        connect4.makeMove(coordinates);
    }

    // Inform the player that it's a draw and close the WebSocket
    function draw() {
        alert("Its a draw");
        wss.close();
    }

    function startCount() {
        var timer = $("number");
        timer.text(0);
        setInterval(function () {
            timer.text((Number.parseFloat(timer.text()) + 0.1).toFixed(2));
        }, 100);
    }

}

$(document).ready(main);