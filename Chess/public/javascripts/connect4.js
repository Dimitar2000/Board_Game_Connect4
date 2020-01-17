

class Connect4 {

    constructor(selector , wss) {
        this.ROWS = 6;
        this.COLS = 7;
        this.selector = selector;
        this.createGrid();
        this.setupEventListeners();
       /* this.myMove = true; */
        this.movedCell = undefined;

    }

    addSocket(wss) {
        this.wss = wss;
    }
    // A function to create the table for Connect4
    // 6 × 7  div elements
    // Every div has attributes "data-col" and "data-row" that show its location on the grid
    createGrid() {

        const $board = $(this.selector);

        for (let row = 0; row < this.ROWS; row++) {

            const $row = $('<div>')
                .addClass('row');

            for (let col = 0; col < this.COLS; col++) {
                const $col = $('<div>')
                    .addClass('col empty')
                    .attr("data-col", col)
                    .attr("data-row", row);
                $row.append($col);
            }

            $board.append($row);
        }
    }

    
    // Ataches event listeners to all cells
    // for hovering and clicking on them
    // This should work only when its this player's move
    setupEventListeners() {

        var that = this;

        const $board = $(this.selector);

        function findLastEmptyCell(col) {
            const cells = $(`.col[data-col=${col}]`);
            for (let i = cells.length - 1; i >= 0; i--) {
                if ($(cells[i]).hasClass("empty")) return $(cells[i]);
            }
            return null;
        }

        $board.on("mouseenter", '.col.empty', function () {
/*             if (!that.myMove) return; 
*/          const col = $(this).data('col');
            const $lastEmptyCell = findLastEmptyCell(col);
            if ($lastEmptyCell) {
                $lastEmptyCell.addClass('next-red');

            }

        });

        $board.on("mouseleave", '.col', function () {
            $('.col').removeClass('next-red');
        });

        $board.on("click", '.col.empty', function () {

            
            
/*            if (!that.myMove) return;
*/
            

            that.myMove = false;
            const col = $(this).data('col');

            const $lastEmptyCell = findLastEmptyCell(col);
            
            if ($lastEmptyCell) {
                
                $lastEmptyCell.addClass("own");
                $lastEmptyCell.removeClass('empty');
                $('.col').removeClass('next-red');
                that.movedCell = $lastEmptyCell;

                $lastEmptyCell.toggleClass("animated");
                setTimeout(function () {
                    $lastEmptyCell.toggleClass("animated");
                }, 1000);
                var victory = that.checkVictory($lastEmptyCell);

                if (victory) {
                    setTimeout(function () {
                        alert(" You win ");
                    } , 1200);                  
                    let winMessage = {
                        reason: "GAMEOVER"
                    };
                    wss.send(JSON.stringify(winMessage));
                }

                else if ($(".empty").length === 0) {
                    let drawMessage = {
                        reason: "DRAW"
                    };
                    wss.send(JSON.stringify(drawMessage));
                }

                else {
                    let row = $lastEmptyCell.data("row");
                    let column = $lastEmptyCell.data("col");

                }
            }

            else $("h4").text("Invalid move. Column alredy filled");

        });



    }


    // Change the colour of a particular cell when the server sends a message that the other player has made a move
    makeMove(coordinates) {
        let row = coordinates[0],
            column = coordinates[1];

        var cell = $(`.col[data-col=column][data-row=row]`);
        cell.removeClass('empty')
            .addClass('enemy')
            .addClass('filled');
        this.myMove = true;
    
    }

    checkVictory(cell) {


        let checkROW = this.movedCell.data("row");
        let checkCOL = this.movedCell.data("col");

        if (this.checkRight(checkROW, checkCOL + 1) + 1 + this.checkLeft(checkROW, checkCOL - 1) >= 4) return true;
        if (this.checkUp(checkROW - 1, checkCOL) + 1 + this.checkDown(checkROW + 1, checkCOL) >= 4) return true;
        if (this.checkDiagonalLeftDown(checkROW + 1, checkCOL - 1) + 1 + this.checkDiagonalRightUp(checkROW - 1, checkCOL + 1) >= 4) return true;
        if (this.checkDiagonalRightDown(checkROW + 1, checkCOL + 1) + 1 + this.checkDiagonalLeftUp(checkROW - 1, checkCOL - 1) >= 4) return true;

    }

     

    checkRight(row , column) {
        if(column > 6) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkRight(row , column + 1); 
    }

    checkLeft(row , column) {
        if(column < 0 ) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkLeft(row , column-1); 
    }

    checkUp(row , column) {
        if( row > 5) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkUp(row - 1 , column); 
    }

    checkDown(row , column) {
        if(row < 0) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkDown(row + 1 , column); 
    }

    checkDiagonalRightUp(row , column) {
        if(row > 5 || column > 6) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkDiagonalRightUp(row - 1 , column + 1); 
    }

    checkDiagonalLeftDown(row , column) {
        if(row < 0 || column < 0) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkDiagonalLeftDown(row + 1 , column - 1);
    }

    checkDiagonalRightDown(row , column) {
        if(row > 5 || column > 6) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkDiagonalRightDown(row + 1, column + 1);
    }

    checkDiagonalLeftUp(row , column) {
        if(row < 0 || column < 0) return 0;
        if(!$(`div[data-row=${row}][data-col=${column}]`).hasClass("own")) return 0;
        return 1 + this.checkDiagonalLeftUp(row - 1, column - 1);
    }

}