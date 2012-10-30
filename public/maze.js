window.onload = function () {
    "use strict";
    var width = 1024,
        height = 768,
        radius = 32,
        wallWidth = 0.5,
        xCount = width / radius,
        yCount = height / radius,
        x,
        y,
        id = 0,
        grid = [],
        cell,
        previousRow = [],
        currentRow = [],
        previousCell = false,
        i,
        g,
        startCell,
        click;

    Crafty.init(width, height);
    Crafty.background('rgb(230,230,230)');

    // our Cell component. Consists of four walls, positional information, and
    // information needed for DFS
    Crafty.c("Cell", {
        init: function () {
            // randomly generate a cell color.
            // prevent it from being close to the same color as the background (230)
            var red =  Math.floor(Math.random() * 200),
                green = Math.floor(Math.random() * 200),
                blue = Math.floor(Math.random() * 200);
            this.color = 'rgb(' + red + ',' + green + ',' + blue + ')';
            //this.color             = 'rgb(0,0,0)';
            this.walls             = {};
            this.left              = true;
            this.top               = true;
            this.right             = true;
            this.bottom            = true;
            this.neighbors         = [];
            this.attachedNeighbors = [];
            this.visited           = false;
        },
        addNeighbor: function (cell) {
            this.neighbors.push(cell);
        },
        getUnVisitedNeighbors: function () {
            var neighbors = [],
                n;
            // grab each neighbor of our current cell that has not been visited
            for (n = 0; n < this.neighbors.length; n++) {
                if (!this.neighbors[n].visited) {
                    neighbors.push(this.neighbors[n]);
                }
            }

            return neighbors;
        },
        getAttachedNeighbors: function () {
            var neighbors = [],
                n;
            for (n = 0; n < this.attachedNeighbors.length; n++) {
                if (!this.attachedNeighbors[n].visited) {
                    neighbors.push(this.attachedNeighbors[n]);
                }
            }
            return neighbors;
        },
        removeWall: function (cell) {
            if (this.x < cell.x) {
                this.right = false;
            } else if (this.y < cell.y) {
                this.bottom = false;
            } else if (this.x > cell.x) {
                this.left = false;
            } else if (this.y > cell.y) {
                this.top = false;
            }
            this.attachedNeighbors.push(cell);
        },
        drawWalls: function () {
            // NOTE: some performance gains can be had here by preventing double rendering of the same wall.
            // create the walls that have not been disabled
            if (this.left) {
                this.walls.left = Crafty.e("2D, Canvas, Color")
                    .color(this.color)
                    .attr({x: this.x + wallWidth, y: this.y, w: wallWidth, h: radius})
                    .bind('DFSCompleted', function () {
                        this.destroy();
                    });
            }
            if (this.top) {
                this.walls.top = Crafty.e("2D, Canvas, Color")
                    .color(this.color)
                    .attr({x: this.x, y: this.y + wallWidth, w: radius, h: wallWidth})
                    .bind('DFSCompleted', function () {
                        this.destroy();
                    });
            }
            if (this.right) {
                this.walls.right = Crafty.e("2D, Canvas, Color")
                    .color(this.color)
                    .attr({x: this.x + radius - wallWidth, y: this.y, w: wallWidth, h: radius})
                    .bind('DFSCompleted', function () {
                        this.destroy();
                    });
            }
            if (this.bottom) {
                this.walls.bottom = Crafty.e("2D, Canvas, Color")
                    .color(this.color)
                    .attr({x: this.x, y: this.y + radius - wallWidth, w: radius, h: wallWidth})
                    .bind('DFSCompleted', function () {
                        this.destroy();
                    });
            }
        },
        connectNeighbor: function (neighbor) {
            var centerX = this.x + (radius / 2),
                centerY = this.y + (radius / 2),
                width = 3,
                height = 3;
            if (this.x > neighbor.x) {
                width = radius;
                centerX = centerX - radius;
            }
            if (this.x < neighbor.x) {
                width = radius;
            }
            if (this.y > neighbor.y) {
                height = radius;
                centerY = centerY - radius;
            }
            if (this.y < neighbor.y) {
                height = radius;
            }
            Crafty.e("2D, Canvas, Color")
                .color('rgb(255,0,0)')
                .attr({x: centerX, y: centerY, w: width, h: height})
                .bind('DFSStarted', function () {
                    this.destroy();
                });
        },
        drawNode: function (color) {
            var width = radius / 2,
                height = radius / 2,
                centerX = this.x + (radius / 2) - (width / 2),
                centerY = this.y + (radius / 2) - (height / 2);
            Crafty.e("2D, Canvas, Color")
                .color(color)
                .attr({x: centerX, y: centerY, w: width, h: height})
                .bind('DFSStarted', function () {
                    this.destroy();
                });
        },
        drawStartNode: function () {
            this.drawNode('rgb(0, 255, 0)');
        },
        drawEndNode: function () {
            this.drawNode('rgb(0, 0, 255)');
        }
    });

    function dfsSearch(startCell, endCell) {
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            stackPopped = false,
            found = false;
        currentCell.visited = true;
        Crafty.trigger('DFSStarted', null);
        while (!found) {
            neighbors = currentCell.getAttachedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                neighborCell.visited = true;
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
                stackPopped = false;
            } else {
                stackPopped = true;
                if (stack.length === 0) {
                    // this point can not be found. bail
                    break;
                }
                currentCell = stack.pop();
            }
            if (currentCell.x === endCell.x && currentCell.y === endCell.y) {
                found = true;
            }
        }
        if (stack.length) {
            stack.push(endCell);
        }
        Crafty.trigger('DFSCompleted', null);
        return stack;
    }

    click = function (event) {
        // on click, use dfs to search our maze
        var stack = dfsSearch(startCell, this);
        if (stack.length) {
            stack.shift();
            startCell = stack.shift();
            startCell.drawStartNode();
            var neighbor;
            while (stack.length) {
                neighbor = stack.shift();
                startCell.connectNeighbor(neighbor);
                neighbor.connectNeighbor(startCell);
                startCell = neighbor;
            }
            neighbor.drawEndNode();
        }
        Crafty.trigger('DrawWalls');
    };
    // build the grid for our DFS and rendering
    for (y = 0; y < yCount; y++) {
        // row information is used to assign neighbors
        currentRow = [];
        for (x = 0; x < xCount; x++) {
            id = x * y + y;
            cell = Crafty.e("2D, Mouse, Cell")
                .attr({id: id, x: x * radius, y:  y * radius})
                .areaMap([0, 0], [radius, 0], [radius, radius], [0, radius])
                .bind('MouseDown', click)
                .bind('DFSStarted', function () {
                    this.visited = false;
                })
                .bind('DrawWalls', function () {
                    this.drawWalls();
                });
            currentRow.push(cell);
            grid.push(cell);
            if (previousCell !== false) {
                previousCell.addNeighbor(cell);
                cell.addNeighbor(previousCell);
            }
            // set our initial start cell to the center of the maze
            if (yCount / 2 === y && xCount / 2 === x) {
                startCell = cell;
            }
            previousCell = cell;
        }
        if (previousRow.length !== 0) {
            for (i = 0; i < previousRow.length; i++) {
                previousRow[i].addNeighbor(currentRow[i]);
                currentRow[i].addNeighbor(previousRow[i]);
            }
        }
        previousRow = currentRow;
        // clear previous cell to prevent wrapped neighbors
        previousCell = false;
    }

    // use dfs to create our maze
    function dfsCreate(startCell) {
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            visited = 1;
        currentCell.visited = true;
        while (visited < grid.length) {
            neighbors = currentCell.getUnVisitedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                visited++;
                neighborCell.visited = true;
                // while building, on move, knock down the walls!
                neighborCell.removeWall(currentCell);
                currentCell.removeWall(neighborCell);
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
            } else {
                currentCell = stack.pop();
            }
        }
    }
    dfsCreate(grid[Math.floor(Math.random() * grid.length)]);
    Crafty.trigger('DrawWalls', null);
};