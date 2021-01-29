var http = require("http");
var ws = require("ws");
var express = require("express");
var app = express();
var objects = require("./objects");
var fs = require("fs");
var ejs = require("ejs");

var port = process.argv[2];
var games = new objects.GameMap();
var waitingResponse = null;
var gameNames = [];
var canConnect = 0;

var buffer = fs.readFileSync("./statistics.json");
var statistics = JSON.parse(buffer)
console.log(statistics);

// Server static files from the public folder
app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");

// On GET request for "/" send splash.html
app.get("/", function (request, response) {
    console.log("[LOG]: Reguest for splash.html");
    response.sendFile("splash.html", { root: "./public" });
});

// On GET request for "/statistics" render the template using ejs
app.get("/statistics", function (request, response) {
    console.log("[LOG]: Request for statistics");
    response.render('statistics', statistics);
});

// On GET request for ""
app.get("/game", function (request, response) {

    console.log("[LOG]: Request for game.html");
    gameNames.push(request.headers.cookie);
    if(!waitingResponse) { waitingResponse = response;}
    else  {
    waitingResponse.sendFile("/game.html", { root: "./public" });
    response.sendFile("/game.html", { root: "./public" });
    waitingResponse = null;
    }

});

const server = http.createServer(app);
const wss = new ws.Server({ server });

wss.on("connection", function (socket, request) {


    socket.on("message", function IncomingMessage(data) {

        var message = JSON.parse(data);
        console.log(message);
        var reason = message.reason;

        switch (reason) {

            case "New Player": {
                if (gameNames.length === 2) newPlayer(socket, false);
                else newPlayer(socket, true);
                break;
            }
            

            case "Move": {
                console.log("Move message sent");
                var game_id = message.game_id;
                var player_id = message.player_id;
                var socketOfPlayer2 = games.getSecondPlayer(game_id, player_id);
                socketOfPlayer2.send(JSON.stringify(message));
                break;
            }

            case "GAMEOVER": {
                sendGameEndingMessage("GAMEOVER", message.game_id , message.player_id);
                break;
            }

            case "DRAW": {
                sendGameEndingMessage("DRAW", message.game_id , message.player_id);
                break;
            }
        }


    });

});

server.listen(port, function (socket) {

    console.log(`Listening on port ${port} ...`);

});

function newPlayer(socket, this_Is_The_First_Player) {

    console.log(this_Is_The_First_Player);
    if (this_Is_The_First_Player) {
        games.addPlayer1(socket);
        console.log("First Player registered : ");
    }
    else {

        let new_game = games.addPlayer2(socket);
        statistics.currentGames++;
        console.log(gameNames);
        
        let socket1 = new_game.con1,
            socket2 = new_game.con2,
            name1 = gameNames[0],
            name2 = gameNames[1],
            p1ID = new_game.id1,
            p2ID = new_game.id2,
            game_id = new_game.game_id;

        gameNames = [];

        let mesForPlayer1 = messageForNewPlayer(p1ID, game_id, name2, true);
        let mesForPlayer2 = messageForNewPlayer(p2ID, game_id, name1, false);

        console.log("Second player registered : " + name2);

        socket1.send(JSON.stringify(mesForPlayer1));
        socket2.send(JSON.stringify(mesForPlayer2));

        canConnect = 0;
    }

}

function messageForNewPlayer(my_id, game_id, player2Name, myMove) {
    return {
        reason: "Game_Start",
        my_id: my_id,
        game_id: game_id,
        player2Name: player2Name,
        myMove: myMove
    }
}

function sendGameEndingMessage(reason, gameID ,  playerID) {
    statistics.currentGames--;
    statistics.totalGames++;
    let losingPlayerSocket = games.getSecondSocket(gameID , playerID);
    losingPlayerSocket.send(JSON.stringify({ reason: reason }));

    setTimeout(function() {
        losingPlayerSocket.close();
        games.removeGame(gameID);
    } , 1000);

}


process.on("SIGINT" , function() {
    fs.writeFileSync("statistics.json" , JSON.stringify(statistics));
    console.log("Writing completed");
    process.exit();
})


