var http = require("http");
var ws = require("ws");
var express = require("express");
var app = express();
var objects = require("./objects");

/* In the beginning we have no game and no players */
var games = new objects.GameMap();
var waitingSocket = null;
var waitingPlayerName = undefined;


var statistics = {
    currentGames: 0,
    totalGames: 0,
    black_wins: 0,
    black_lose: 0
}



app.get("/", function (request, response) {
    console.log("Reguest for splash.html");
    response.sendFile("/splash.html", { root: "." });
});

app.get("/game.html", function (request, response) {
    console.log("Request for game.html ..");
    setTimeout(function () {
        response.sendStatus();
        return;
    }, 30000)
    while (waitingSocket == null) { }
    response.sendFile("/game.html", { root: "." });
});
app.use(express.static("."));
app.get("/statistics", function (request, response) {
    console.log("Request for statistics");
    response.send(JSON.stringify(statistics));
});

const server = http.createServer(app);
const wss = new ws.Server({ server });

wss.on("connection", function (socket, request) {

    console.log("new Player");
    socket.on("message", function IncomingMessage(data) {

        var message = JSON.parse(data);
        var reason = message.reason;

        switch (reason) {

            case "New Player": {
                if (waitingSocket) newSecondPlayer(message.name, socket);
                else newFirstPlayer(message.name, socket);
                break;
            }

            case "Move": {
                var game_id = message.game_id;
                var player_id = message.player_id;
                var socketOfPlayer2 = games.getSecondPlayer(game_id, player_id);
                socketOfPlayer2.send(JSON.stringify(message));
                break;
            }

            case "GAMEOVER": {

                statistics.currentGames--;
                let sockets = games.removeGame(socket);
                let losingPlayerSocket = (sockets[0] === socket) ? sockets[1] : sockets[0];
                losingPlayerSocket.send(JSON.stringify({ reason: "GAMEOVER" }), function () {
                    sockets[0].close();
                    sockets[1].close();
                });
        
            }
        }


    });

});

server.listen(8000, function (socket) {

    console.log("Listening on port 8000 ...");

});  

function newFirstPlayer(name , socket) {
    games.addPlayer1(socket);
    waitingSocket = socket;
    waitingPlayerName = name;
}

function newSecondPlayer(name , socket) {
    var new_game = games.addPlayer2(socket);

    waitingSocket = undefined;
    statistics.currentGames++;

    let socket1 = new_game.con1,
        socket2 = new_game.con2,
        name1 = waitingPlayerName,
        name2 = name,
        p1ID = new_game.id1,
        p2ID = new_game.id2,
        game_id = new_game.game_id;

    let mesForPlayer1 = messageForNewPlayer(p1ID, game_id, name2 , true);
    let mesForPlayer2 = messageForNewPlayer(p2ID, game_id, name1 , false);
    socket1.send(JSON.stringify(mesForPlayer1));
    socket2.send(JSON.stringify(mesForPlayer2));

    waitingPlayerName = undefined;
}

function messageForNewPlayer(my_id, game_id, player2Name , move) {
    return {
        reason: "Game_Start",
        my_id: my_id,
        game_id: game_id,
        player2Name: player2Name,
        move : move
    }
}



/*
 Messages: 

1) "New Player" message = {
                            name: "Dimitar"
                                }
2) "Move" = {
             game_id : "A number"
             player_id : "A number"
             filled_cell : "An array with coordinates [x , y] 
             }
    
3) "Game_Over" = {
                   game_id : "A number",
                   player_id : "A number"

                    }

                  
 
 SEND : "Game_Start" = {
                    reason: "Game_Start"
                    my_id : "A number"
                    game_id : "A number"
                    player2Name : "Dimitar"             
                    }
 
 
 
 */














