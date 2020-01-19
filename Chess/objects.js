

class Player {
    constructor(id, connection) {
        this.id = id;
        this.connection = connection;
    }
}

class Game {

    constructor(id , player1, player2) {
        this.id = id;
        this.player1 = player1;
        this.player2 = player2;
    }

    hasSocket(socket) {
        return this.player1.connection === socket || this.player2.connection === socket;
    }

}

class GameMap {

    constructor() {
        this.new_game_id = 0;
        this.new_player_id = 0;
        this.waiting_player = undefined;
    };

    addPlayer1(connection) {
        this.waiting_player = new Player(this.new_player_id, connection);
        this.new_player_id++;
    }

    addPlayer2(connection) {

        // Creates a new Game object with waiting_player(Player 1) and the new Player(Player 2)
        // Then it returns an array with their corresponding connection objects so that the server can send them game.html

        var player2 = new Player(this.new_player_id++, connection);
        var new_game = new Game(this.new_game_id, this.waiting_player, player2);

        this.waiting_player = undefined;       // We do not have any waiting players now
        this.new_game_id;                      // 
        this.addGame(new_game);

        return {
            game_id: new_game.id,
            con1: new_game["player1"].connection,
            id1: new_game["player1"].id,
            con2: new_game["player2"].connection,
            id2: new_game["player2"].id
        };
    }

    addGame(game) {
        this["game" + this.new_game_id] = game;
        this.new_game_id++;
    }

    getSecondSocket(game_id , player_id) {
        
        let gameToBeFinished = this["game" + game_id];
        let secondPlayerID = (player_id % 2 === 0) ? 2 : 1;
        return gameToBeFinished["player" + secondPlayerID].connection;
    }

    removeGame(i) {
        this["game" + i] = undefined;
    }

    getSecondPlayer(game_id, player_id) {
        var game = this["game" + game_id];
        let spID = (player_id % 2 === 0) ? 2 : 1;
        var player = game["player" + spID];
        console.log("Came from player" + player_id + " And went to player " + spID)
        return player.connection;
    }
        
}

module.exports.GameMap = GameMap;

