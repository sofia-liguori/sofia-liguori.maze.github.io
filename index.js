const { 
    Engine, 
    Render, 
    Runner, 
    World, 
    Bodies,
    Body,
    Events
} = Matter;


// CONFIG VARIABLES //
const cellsX = 6;
const cellsY = 5;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width/cellsX;
const unitLengthY = height/cellsY;

// ENGINE //s
const engine = Engine.create();


const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height,
        // background-co  lor: red
        // { fillStyle: '#ffefe7'}
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// START GANE //
document.querySelector('.start').addEventListener('click', () => {
    document.querySelector('.landing').classList.add('hidden');
    document.querySelector('.start').classList.add('hidden');
    document.querySelector('.layer').classList.add('hidden');
})

const buildMaze = () => {
    engine.world.gravity.y = 0;
    // BORDERS //
    const borders = [
        Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
        Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
        Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
        Bodies.rectangle(width, height/2, 2, height, {isStatic: true}),
    ];
    World.add(world, borders);

    // MAZE GENERATION //
    const shuffle = (arr) => {
        let counter = arr.length;

        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);
            counter--;
            const temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }

        return arr;
    };

    // THE GRID //
    const grid = Array(cellsY)
        .fill(null)
        .map(() => Array(cellsX).fill(false));

    const verticals = Array(cellsY)
        .fill(null)
        .map(() => Array(cellsX-1).fill(false));

    const horizontals = Array(cellsY-1)
        .fill(null)
        .map(() => Array(cellsX).fill(false));

    const startRow = Math.floor(Math.random() * cellsY);
    const startCol = Math.floor(Math.random() * cellsX);

    const moveCell = (row , column) => {
        //if i have visited cell at [row, col], then return
        if (grid[row][column]) {
            return;
        }

        //mark this cell as visited
        grid[row][column] = true;

        //assemble random order list neighbours
        const neighbours = shuffle([
            [row-1, column, 'up'],
            [row+1, column, 'down'],
            [row, column-1, 'left'],
            [row, column+1, 'right']
        ]);

        //for each neighbour...
        for (let neighbour of neighbours) {
            const [nextRow, nextCol, direction] = neighbour;
            
            //is neighbour out of bounds
            if (
                nextRow < 0 || 
                nextRow >= cellsY || 
                nextCol < 0 || 
                nextCol >= cellsX
            ) {
                continue;
            }
        
            //if visited neighbour, continue to next neighbour
            if (grid[nextRow][nextCol]){
                continue;
            }

            // remove wall from either horizontals or verticals 
            if (direction === 'left'){
                verticals[row][column-1] = true;
            } else if (direction === 'right'){
                verticals[row][column] = true;
            } else if (direction === 'up'){
                horizontals[row-1][column] = true;
            } else if (direction === 'down'){
                horizontals[row][column] = true;
            }

            moveCell(nextRow, nextCol);
        };
        
        //visit next cell

    };

    moveCell(startRow, startCol);

    // moveCell(1, 1);
    // console.log(horizontals);

    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            } 

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2, 
                rowIndex * unitLengthY + unitLengthY, 
                unitLengthX, 
                5,
                { 
                    isStatic: true,
                    label: 'wall',
                    render: {
                        fillStyle: 'white'
                    }
                }
            );
            World.add(world, wall);
        });
    });

    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            } 

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX, 
                rowIndex * unitLengthY + unitLengthY / 2, 
                5,
                unitLengthY, 
                { 
                    isStatic: true,
                    label: 'wall',
                    render: {
                        fillStyle: 'white'
                    }
                }
            );
            World.add(world, wall);
        });
    });

    // GOAL //
    const goal = Bodies.rectangle(
        width - unitLengthX / 2,
        height - unitLengthY / 2,
        unitLengthX / 2,
        unitLengthY / 2,
        { 
            isStatic: true,
            label: 'goal',
            render: {
                fillStyle: 'pink'
            }
        }
    );
    World.add(world, goal);

    // USER BALL //
    const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
    const ball = Bodies.circle(
        unitLengthX / 2,
        unitLengthY / 2,
        ballRadius,
        { 
            label: 'ball',
            render: {
                fillStyle: '#dda384'
            } 
        }
    );
    World.add(world, ball);

    // MOVE USER //
    document.addEventListener('keydown', event => {
        const { x, y } = ball.velocity;

        document.querySelector('.landing').classList.add('hidden');
        document.querySelector('.start').classList.add('hidden');
        document.querySelector('.layer').classList.add('hidden');

        //MOVE UP
        if (event.keyCode === 87) {
            Body.setVelocity(ball, { x, y: y - 6 });
            console.log('UP');
        }

        //MOVE DOWN
        if (event.keyCode === 83) {
            Body.setVelocity(ball, { x, y: y + 6 });
        }

        //MOVE LEFT
        if (event.keyCode === 65) {
            Body.setVelocity(ball, { x: x - 6 , y });
        }

        //MOVE RIGHT
        if (event.keyCode === 68) {
            Body.setVelocity(ball, { x: x + 6 , y });
        }
    });

    // WIN CONDITION //
    Events.on(engine, 'collisionStart', event => {
        event.pairs.forEach(collision => {
            const labels = ['ball', 'goal'];

            if (
                labels.includes(collision.bodyA.label) &&
                labels.includes(collision.bodyB.label)
            ) {
                document.querySelector('.winner').classList.remove('hidden');
                document.querySelector('.replay').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach( body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false)
                    }
                })
                document.querySelector('.replay').addEventListener('click', () => {
                    document.querySelector('.winner').classList.add('hidden');
                    document.querySelector('.replay').classList.add('hidden');
                    document.querySelector('.landing').classList.remove('hidden');
                    document.querySelector('.start').classList.remove('hidden');
                    document.querySelector('.layer').classList.remove('hidden');
                    World.clear(world, false);
                    buildMaze();
                })
                // alert('YOU WIN');
            }
        })
    });

}

buildMaze();
