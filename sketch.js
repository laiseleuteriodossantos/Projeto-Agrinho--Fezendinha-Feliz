let tileSize = 60;
let farmGrid = [];
let cols, rows;
let skyColor, grassColor, dirtColor;
// Configurações do trator
let tractorX, tractorY;
let tractorWidth = 80;
let tractorHeight = 50;
let tractorSpeed = 5;
let tractorColors = [];
let selectedTractorColor;
let plantIsGrowing = false;
// Configurações da colheitadeira
let harvesterX, harvesterY;
let harvesterSpeed = 3;
let harvesterWidth = 70;
let harvesterHeight = 40;
let controllingHarvester = false;
// Váriaveis para o ponto de coleta
let harvestCollectionPoint = { x: 0, y: 0 }; // Will be updated in setup
let collectedCropInStorage = 0;
let maxStorageCapacity = 50;
// Configurações do caminhão de transporte
let truckX, truckY;
let truckWidth = 120;
let truckHeight = 60;
let truckSpeed = 2;
let truckActive = false;
let truckCapacity = 10;
let currentTruckLoad = 0;
let truckDestination = 'collection';
let truckLoadingState = 'idle';
let truckShouldAppear = false;
// Botão para enviar caminhão
let sendTruckButton = {
    x: 0,
    y: 0,
    width: 150,
    height: 40,
    visible: false
};
// Controle de exibição
let showFarmGrid = true;
// Váriaveis de dinheiro
let totalMoney = 0;
let cropValue = 5;
// Estados do jogo
const STATE_DIRT = 0;
const STATE_PLANT = 1;
const STATE_HARVEST = 2;
const GAME_STATE_START_SCREEN = 0;
const GAME_STATE_PLAYING = 1;
const GAME_STATE_CELLPHONE_SCREEN = 2; // Novo estado para a tela do celular
let currentGameState = GAME_STATE_START_SCREEN;
// Variáveis de controle
let allCropsPlanted = false;
let allCropsHarvested = false;
// Configurações das culturas
let cropOptions = [];
let selectedCrop = null;
// Nuvens
let clouds = [];
let maxClouds = 5;
let cloudSpeed = 0.5;
// Birds
let birds = [];
let maxBirds = 8; // Número de pássaros
let birdSpeed = 2; // Velocidade dos pássaros
let birdSize = 15; // Tamanho dos paássaros

// Variáveis para a tela do celular
let currentQuestionIndex = 0;
let questions = [];
let showCellphone = false; // Controla quando a tela do celular aparece
let answerButtons = []; // Para armazenar as posições dos botões de resposta
let playerAnswered = false; // Para evitar múltiplas respostas à mesma pergunta

function setup() {
    let canvasWidth = windowWidth;
    let canvasHeight = windowHeight;

    if (windowWidth > 850) {
        canvasWidth = 750;
        canvasHeight = 600;
    }

    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('game-container');

    cols = floor((width - tileSize * 4) / tileSize);
    rows = floor((height - tileSize * 4) / tileSize);

    // Cores
    dirtColor = color(139, 69, 19);
    skyColor = color(135, 206, 235);
    grassColor = color(124, 252, 0);

    // Cores do trator
    tractorColors = [
        color("red"),
        color("blue"),
        color("green"),
        color("pink")
    ];
    selectedTractorColor = tractorColors[0];

    // Opções para plantar
    cropOptions = [
        { name: 'Milho', plantColor: 'rgb(34, 139, 34)', harvestColor: 'rgb(255, 140, 0)', uiText: 'Plantar Milho', emoji: '🌽' },
        { name: 'Morango', plantColor: 'rgb(124, 252, 0)', harvestColor: 'rgb(255, 0, 0)', uiText: 'Plantar Morango', emoji: '🍓' },
        { name: 'Maçã', plantColor: 'rgb(50, 205, 50)', harvestColor: 'red', uiText: 'Plantar Maçã', emoji: '🍎' },
        { name: 'Tomate', plantColor: 'rgb(0, 100, 0)', harvestColor: 'rgb(255, 99, 71)', uiText: 'Plantar Tomate', emoji: '🍅' }
    ];

    // Ponto de coleta
    harvestCollectionPoint = {
        x: 120, // Adjusted X coordinate
        y: height - tileSize * 0.8 // Adjusted Y coordinate
    };

    // Defina as perguntas no setup
    questions = [
        {
            question: "Parabéns pela sua primeira colheita! O que você achou de usar o trator?",
            options: [
                { text: "Muito divertido!", value: "fun" },
                { text: "Um pouco difícil no começo.", value: "hard" },
                { text: "Achei bem produtivo.", value: "productive" }
            ],
            // Ação a ser executada após a resposta
            action: (answerValue) => {
                console.log("Resposta à pergunta 1:", answerValue);
                if (answerValue === "productive") {
                    totalMoney += 50; // Recompensa extra por ser produtivo!
                    console.log("Você ganhou +$50 por ser produtivo!");
                }
            }
        },
        {
            question: "Qual foi a parte mais desafiadora da colheita?",
            options: [
                { text: "Manobrar a colheitadeira.", value: "harvester" },
                { text: "Esperar as plantas crescerem.", value: "grow" },
                { text: "Entender o preço da venda.", value: "price" }
            ],
            action: (answerValue) => {
                console.log("Resposta à pergunta 2:", answerValue);
                if (answerValue === "harvester") {
                    console.log("A colheitadeira realmente exige prática!");
                }
            }
        },
        {
            question: "Você tem alguma dica para futuros fazendeiros?",
            options: [
                { text: "Paciência é chave!", value: "patience" },
                { text: "Explore bem o mapa.", value: "explore" },
                { text: "Use os veículos com sabedoria.", value: "vehicles" }
            ],
            action: (answerValue) => {
                console.log("Resposta à pergunta 3:", answerValue);
                // Nenhuma recompensa específica, apenas feedback
            }
        }
    ];


    initializeFarmGrid();
    resetGameElements();
    initializeClouds();
    initializeBirds(); // Initialize birds here
}

function draw() {
    if (currentGameState === GAME_STATE_START_SCREEN) {
        drawStartScreen();
    } else if (currentGameState === GAME_STATE_PLAYING) {
        drawGame();
        checkAllCropsHarvested();
        // Verificamos aqui se todas as colheitas foram vendidas
        // e, se sim, se é hora de mostrar a tela do celular.
        if (allCropsHarvested && !showCellphone && totalMoney > 0) { // Adicionada condição totalMoney > 0 para garantir que vendeu algo
            showCellphone = true;
            currentGameState = GAME_STATE_CELLPHONE_SCREEN;
            currentQuestionIndex = 0; // Começa da primeira pergunta
            playerAnswered = false; // Resetar para a nova pergunta
            setupAnswerButtons(); // Configurar os botões para a primeira pergunta
        }
    } else if (currentGameState === GAME_STATE_CELLPHONE_SCREEN) {
        drawCellphoneScreen();
    }
}

// Página inicial
function drawStartScreen() {
    background(skyColor);
    drawClouds();
    drawBirds(); // Draw birds on start screen too
    fill("blue");
    textAlign(CENTER, CENTER);
    textSize(width * 0.1);
    text('Minha Fazendinha', width / 2, height / 2 - height * 0.30);

    textSize(width * 0.05);
    fill("white");
    text('Personalize seu Trator:', width / 2, height / 2 - height * 0.10);

    drawTractorColorSelection();

    textSize(width * 0.04);
    fill(255);
    text('Selecione o que deseja plantar:', width / 2, height / 2 + height * 0.20);

    drawCropSelectionButtons();

    if (selectedCrop && selectedTractorColor) {
        textSize(width * 0.04);
        fill(255, 255, 0);
        text('Clique ou Pressione qualquer tecla para começar', width / 2, height - height * 0.07);
    } else {
        textSize(width * 0.035);
        fill("white");
        text('Selecione a cor do trator e o que plantar para começar!', width / 2, height - height * 0.03);
    }
}

function drawGame() {
    background(skyColor);
    drawClouds();
    drawBirds(); // Draw birds in game screen
    drawFarmScene();

    if (showFarmGrid) {
        drawFarmGrid();
    }

    drawVehicles();
    drawCollectionPoint(); // This function now handles its own positioning
    drawUI();
    handleGameLogic();
}

function drawFarmScene() {
    fill(124, 252, 0);
    rect(0, height - 150, width, 150);
    drawFence();
    // Mercado
    drawBarn(width - 140, height - 140);
    // Tree
    drawTree(50, height - 250);
    // Sun
    drawSun();
}

function drawSun() {
    let sunX = width - 80; // Posição X do sol (canto superior direito)
    let sunY = 80;       // Posição Y do sol
    let sunSize = 70;    // Tamanho do emoji do sol

    // Desenha o emoji do sol
    textSize(sunSize);
    textAlign(CENTER, CENTER);
    text('☀️', sunX, sunY);
}

function drawFence() {
    fill(139, 69, 19);
    let fenceHeight = 60;
    let postWidth = 15;
    let railHeight = 10;

    for (let x = 0; x < width; x += 50) {
        rect(x, height - 150 - fenceHeight, postWidth, fenceHeight);
    }

    rect(0, height - 150 - fenceHeight + 10, width, railHeight);
    rect(0, height - 150 - fenceHeight + 40, width, railHeight);
}

function drawBarn(x, y) {
    // Tamanho do mercado
    let marketWidth = 120;
    let marketHeight = 90;

    // Corpo principal do mercado
    fill(210, 150, 140); // Cor de madeira clara
    rect(x, y, marketWidth, marketHeight);

    // Telhado do mercado
    fill(139, 0, 0);
    triangle(x, y, x + marketWidth, y, x + marketWidth / 2, y - 60);

    // Porta do mercado
    fill(101, 69, 33);
    rect(x + marketWidth / 2 - 20, y + marketHeight / 2, 40, marketHeight / 2);

    // Janelas do mercado
    fill(255, 255, 200);
    rect(x + 20, y + 20, 25, 25);
    rect(x + marketWidth - 45, y + 20, 25, 25);

    // Placa do mercado
    fill(255, 255, 0);
    rect(x + marketWidth / 2 - 30, y - 70, 60, 15);
    fill(0);
    textSize(10);
    textAlign(CENTER, CENTER);
    text("MERCADO", x + marketWidth / 2, y - 63);
}

function drawTree(x, y) {
    fill(101, 67, 33);
    rect(x, y, 30, 100);

    fill("green");
    ellipse(x + 15, y - 30, 95, 100);
}

function drawTractorColorSelection() {
    let colorBoxSize = width * 0.08;
    let startX = width / 2 - (tractorColors.length * (colorBoxSize + width * 0.04)) / 2;
    let startY = height / 2 - height * 0.04;

    for (let i = 0; i < tractorColors.length; i++) {
        let x = startX + i * (colorBoxSize + width * 0.04);
        let y = startY;

        fill(tractorColors[i]);
        stroke(255);
        strokeWeight(2);
        rect(x, y, colorBoxSize, colorBoxSize);

        if (tractorColors[i] === selectedTractorColor) {
            stroke(255, 255, 0);
            strokeWeight(4);
            noFill();
            rect(x, y, colorBoxSize, colorBoxSize);
        }
    }
}

function drawCropSelectionButtons() {
    let buttonWidth = width * 0.2;
    let buttonHeight = height * 0.04;
    let padding = width * 0.03;
    let totalWidth = cropOptions.length * (buttonWidth + padding) - padding;
    let startX = width / 2 - totalWidth / 2;
    let startY = height / 2 + height * 0.25;

    for (let i = 0; i < cropOptions.length; i++) {
        let x = startX + i * (buttonWidth + padding);
        let y = startY;

        let currentCrop = cropOptions[i];

        fill(currentCrop.plantColor);
        stroke(255);
        strokeWeight(2);
        rect(x, y, buttonWidth, buttonHeight, 10);

        fill(255);
        noStroke();
        textSize(width * 0.02);
        text(currentCrop.uiText, x + buttonWidth / 2, y + buttonHeight / 2);

        if (selectedCrop && selectedCrop.name === currentCrop.name) {
            stroke(255, 255, 0);
            strokeWeight(4);
            noFill();
            rect(x, y, buttonWidth, buttonHeight, 10);
        }
    }
}
function drawFarmGrid() {
    let offsetX = (width - cols * tileSize) / 2;
    let offsetY = (height - rows * tileSize) / 2;

    if (offsetY < height / 2 - rows * tileSize / 2) {
        offsetY = height / 2 - rows * tileSize / 2;
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * tileSize + offsetX;
            let y = j * tileSize + offsetY;

            stroke(50);
            strokeWeight(1);

            switch (farmGrid[i][j]) {
                case STATE_DIRT:
                    fill(dirtColor);
                    rect(x, y, tileSize, tileSize);
                    break;
                case STATE_PLANT:
                    fill(dirtColor);
                    rect(x, y, tileSize, tileSize);
                    drawPlantStalk(x, y, color(selectedCrop.plantColor), selectedCrop.name);
                    break;
                case STATE_HARVEST:
                    fill(dirtColor);
                    rect(x, y, tileSize, tileSize);
                    drawPlantStalk(x, y, color(selectedCrop.harvestColor), selectedCrop.name, true);
                    break;
            }
        }
    }
}
function drawPlantStalk(x, y, pColor, cropType, harvested = false) {
    let centerX = x + tileSize / 2;
    let bottomY = y + tileSize;

    fill(85, 107, 47);
    rect(centerX - 3, bottomY - tileSize * 0.8, 6, tileSize * 0.8);

    fill(pColor);
    triangle(centerX - 3, bottomY - tileSize * 0.6,
        centerX - tileSize * 0.3, bottomY - tileSize * 0.4,
        centerX - 3, bottomY - tileSize * 0.4);
    triangle(centerX + 3, bottomY - tileSize * 0.6,
        centerX + tileSize * 0.3, bottomY - tileSize * 0.4,
        centerX + 3, bottomY - tileSize * 0.4);

    if (harvested) {
        let emojiToDisplay = '';
        for (let i = 0; i < cropOptions.length; i++) {
            if (cropOptions[i].name === cropType) {
                emojiToDisplay = cropOptions[i].emoji;
                break;
            }
        }

        if (emojiToDisplay) {
            textSize(tileSize * 0.7);
            textAlign(CENTER, CENTER);
            text(emojiToDisplay, centerX, bottomY - tileSize * 0.4);
        }
    }
}
function drawVehicles() {
    if (!allCropsPlanted && showFarmGrid) {
        drawTractor();
    }
    if (showFarmGrid) {
        drawHarvester();
    }
    if (truckActive || truckShouldAppear) {
        drawTruck();
    }
}
function drawTractor() {
    push();
    translate(tractorX, tractorY);
    fill(selectedTractorColor);
    rectMode(CENTER);
    rect(0, 0, tractorWidth, tractorHeight);

    fill(100, 100, 100);
    rect(-tractorWidth / 4, -tractorHeight / 2 - 10, tractorWidth / 2, tractorHeight / 2);

    fill(50, 50, 50);
    ellipse(-tractorWidth / 2 + 15, tractorHeight / 2, 30, 30);
    ellipse(tractorWidth / 2 - 15, tractorHeight / 2, 30, 30);
    ellipse(-tractorWidth / 2 + 30, tractorHeight / 2, 20, 20);
    ellipse(tractorWidth / 2 - 30, tractorHeight / 2, 20, 20);

    fill(50, 50, 50);
    rect(-tractorWidth / 2 + 5, -tractorHeight / 2 - 25, 8, 15);
    pop();
}
function drawHarvester() {
    push();
    translate(harvesterX, harvesterY);
    fill("yellow");
    rectMode(CENTER);
    rect(0, 0, harvesterWidth, harvesterHeight);

    fill(100, 100, 100);
    rect(-harvesterWidth / 4, -harvesterHeight / 2 - 5, harvesterWidth / 2, harvesterHeight / 2);

    fill(150, 150, 150);
    rect(harvesterWidth / 2 + 10, 0, 30, harvesterHeight * 0.9);

    fill(50, 50, 50);
    ellipse(-harvesterWidth / 3, harvesterHeight / 2, 30, 30);
    ellipse(harvesterWidth / 3, harvesterHeight / 2, 30, 30);
    ellipse(-harvesterWidth / 3 + 15, harvesterHeight / 2, 20, 20);
    ellipse(harvesterWidth / 3 - 15, harvesterHeight / 2, 20, 20);

    fill(50, 50, 50);
    rect(-harvesterWidth / 2 + 10, -harvesterHeight / 2 - 15, 8, 10);
    pop();
}
function drawTruck() {
    if (!truckActive) return;

    push();
    translate(truckX, truckY);
    rectMode(CENTER);

    // Desenha o emoji do caminhão
    textSize(truckHeight * 1.5); // Ajusta o tamanho do emoji
    textAlign(CENTER, CENTER);
    text('🚛', 0, 0);

    if (currentTruckLoad > 0 && selectedCrop) {
        // Desenha os emojis das colheitas no caminhão
        textSize(tileSize * 0.25); // Um pouco maior para ser mais visível no caminhão
        textAlign(CENTER, CENTER);
        let emojiSpacing = tileSize * 0.3;
        let emojisPerRow = 4;
        let emojiCount = min(floor(currentTruckLoad), 12); // Limita a 12 emojis

        for (let i = 0; i < emojiCount; i++) {
            let row = floor(i / emojisPerRow);
            let col = i % emojisPerRow;
            // Ajuste a posição para os emojis aparecerem como se estivessem dentro da caçamba
            let xOffset = -truckWidth * 0.3 + col * emojiSpacing;
            let yOffset = truckHeight * 0.1 + row * emojiSpacing * 0.6; // Ajuste Y para aparecer mais abaixo
            text(selectedCrop.emoji, xOffset, yOffset);
        }
    }
    pop();
}
function drawCollectionPoint() {
    push();
    // Posição ajustada para o canto inferior esquerdo
    translate(harvestCollectionPoint.x, harvestCollectionPoint.y);
    fill("gray");
    stroke(50);
    strokeWeight(2);
    rectMode(CENTER);
    rect(0, 0, tileSize * 2, tileSize * 1.5, 10);

    if (collectedCropInStorage > 0 && selectedCrop) {
        fill(color(selectedCrop.harvestColor));
        noStroke();
        let fillHeight = map(collectedCropInStorage, 0, maxStorageCapacity, 0, tileSize * 1.2);
        rect(0, tileSize * 0.75 - fillHeight / 2, tileSize * 1.8, fillHeight);

        // Desenha vários emojis pequenos no estoque
        textSize(tileSize * 0.3);
        textAlign(CENTER, CENTER);
        let emojiSpacing = tileSize * 0.3;
        let emojisPerRow = 3;
        let emojiCount = min(floor(collectedCropInStorage / 2), 9); // Limita a 9 emojis

        for (let i = 0; i < emojiCount; i++) {
            let row = floor(i / emojisPerRow);
            let col = i % emojisPerRow;
            let xOffset = (col - 1) * emojiSpacing;
            let yOffset = tileSize * 0.5 - fillHeight / 2 + row * emojiSpacing * 0.7;
            text(selectedCrop.emoji, xOffset, yOffset);
        }
    }

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    // Texto do estoque posicionado acima do ponto de coleta
    text('Estoque: ' + collectedCropInStorage + ' / ' + maxStorageCapacity, 0, -tileSize * 1.0);
    pop();
}
function drawUI() {
    fill("black");
    textSize(width * 0.025);
    textAlign(LEFT, TOP);
    text('Em transporte: ' + currentTruckLoad + ' / ' + truckCapacity, 10, 10);
    text('Controlando: ' + (controllingHarvester ? 'Colheitadeira (SETAS)' : 'Trator (SETAS)'), 10, 35);
    text('Pressione H para selecionar veículo', 10, 61);
    fill("rgb(236,215,215)");
    textAlign(RIGHT, TOP);
    text('💰 $' + totalMoney, width - 10, 10);

    // Desenha o botão de enviar caminhão
    if (collectedCropInStorage > 0 && !truckActive && !truckShouldAppear && showFarmGrid && selectedCrop) {
        sendTruckButton.visible = true;
        // Posição do botão de enviar caminhão, ajustada para não sobrepor o estoque
        sendTruckButton.x = width - 160;
        sendTruckButton.y = height - 50;

        fill(0, 150, 0);
        rect(sendTruckButton.x, sendTruckButton.y, sendTruckButton.width, sendTruckButton.height, 5);
        fill(255);
        textSize(12);
        textAlign(CENTER, CENTER);
        text('Enviar Caminhão (' + collectedCropInStorage + ' ' + selectedCrop.emoji + ')',
            sendTruckButton.x + sendTruckButton.width / 2,
            sendTruckButton.y + sendTruckButton.height / 2);
    } else {
        sendTruckButton.visible = false;
    }

    // Mensagem de conclusão (modifiquei levemente)
    // Esta mensagem agora será exibida após as perguntas do celular, ou se você não implementá-las.
    if (allCropsHarvested && !showCellphone && currentGameState !== GAME_STATE_CELLPHONE_SCREEN) {
         fill(0, 100, 0, 200);
         rect(width / 2 - 200, height / 2 - 60, 400, 120, 20);
         fill(255);
         textSize(18);
         textAlign(CENTER, CENTER);
         text('Todas as colheitas foram vendidas! ' + (selectedCrop ? selectedCrop.emoji : ''), width / 2, height / 2 - 20);
         textSize(24);
         text('Parabéns! Você ganhou $' + totalMoney, width / 2, height / 2 + 20);
    }
}
function initializeClouds() {
    clouds = [];
    for (let i = 0; i < maxClouds; i++) {
        clouds.push({
            x: random(width),
            y: random(height / 4),
            size: random(50, 150),
            speed: random(0.3, 1.0) * cloudSpeed
        });
    }
}
function drawClouds() {
    fill(255, 255, 255, 200);
    noStroke();
    for (let i = 0; i < clouds.length; i++) {
        let cloud = clouds[i];
        ellipse(cloud.x, cloud.y, cloud.size * 0.8, cloud.size * 0.6);
        ellipse(cloud.x + cloud.size * 0.3, cloud.y - cloud.size * 0.2, cloud.size * 0.7, cloud.size * 0.5);
        ellipse(cloud.x - cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.6, cloud.size * 0.4);
        ellipse(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.6, cloud.size * 0.5);
        ellipse(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.5, cloud.size * 0.4);

        cloud.x += cloud.speed;

        if (cloud.x > width + cloud.size / 2) {
            cloud.x = -cloud.size / 2;
            cloud.y = random(height / 4);
            cloud.size = random(50, 150);
            cloud.speed = random(0.3, 1.0) * cloudSpeed;
        }
    }
}

// --- Birds Code ---
function initializeBirds() {
    birds = [];
    for (let i = 0; i < maxBirds; i++) {
        birds.push({
            x: random(width),
            y: random(height / 3), // Birds will fly in the upper third of the screen
            speed: random(0.2, 1.1) * birdSpeed,
            // Direction: -1 for left, 1 for right. Randomly assign for variety.
            direction: random() > 0.5 ? 1 : -1
        });
    }
}
function drawBirds() {
    for (let i = 0; i < birds.length; i++) {
        let bird = birds[i];
        drawBird(bird.x, bird.y, birdSize, bird.direction);

        bird.x += bird.speed * bird.direction;

        // If bird goes off-screen, reset its position to the other side
        if (bird.direction === 1 && bird.x > width + birdSize) {
            bird.x = -birdSize;
            bird.y = random(height / 3);
            bird.speed = random(0.5, 1.8) * birdSpeed;
            bird.direction = random() > 0.5 ? 1 : -1; // New random direction
        } else if (bird.direction === -1 && bird.x < -birdSize) {
            bird.x = width + birdSize;
            bird.y = random(height / 3);
            bird.speed = random(0.5, 1.5) * birdSpeed;
            bird.direction = random() > 0.5 ? -1 : 1; // New random direction
        }
    }
}
function drawBird(x, y, size, direction) {
    push();
    translate(x, y);
    if (direction === 1) { // Flip bird if moving left
        scale(-1, 1);
    }

    // Display the bird emoji
    textSize(size * 1.7); // Make the emoji larger
    textAlign(CENTER, CENTER);
    text('🐦', 0, 0);

    pop();
}
// --- End Birds Code ---
function handleGameLogic() {
    checkAllCropsPlanted();
    handleVehicleMovement();
    handleTruckLogic();
    if (showFarmGrid) {
        checkPlantGrowth();
    }
}
function handleVehicleMovement() {
    if (controllingHarvester && showFarmGrid) {
        if (keyIsDown(65)) harvesterX -= harvesterSpeed;
        if (keyIsDown(68)) harvesterX += harvesterSpeed;
        if (keyIsDown(87)) harvesterY -= harvesterSpeed;
        if (keyIsDown(83)) harvesterY += harvesterSpeed;

        if (keyIsDown(LEFT_ARROW)) harvesterX -= harvesterSpeed;
        if (keyIsDown(RIGHT_ARROW)) harvesterX += harvesterSpeed;
        if (keyIsDown(UP_ARROW)) harvesterY -= harvesterSpeed;
        if (keyIsDown(DOWN_ARROW)) harvesterY += harvesterSpeed;

        harvesterX = constrain(harvesterX, harvesterWidth / 2, width - harvesterWidth / 2);
        harvesterY = constrain(harvesterY, harvesterHeight / 2, height - harvesterHeight / 2);

        if (allCropsPlanted) {
            checkHarvesterCollision();
        }
    } else {
        if (!allCropsPlanted && showFarmGrid) {
            let moved = false;
            if (keyIsDown(LEFT_ARROW)) { tractorX -= tractorSpeed; moved = true; }
            if (keyIsDown(RIGHT_ARROW)) { tractorX += tractorSpeed; moved = true; }
            if (keyIsDown(UP_ARROW)) { tractorY -= tractorSpeed; moved = true; }
            if (keyIsDown(DOWN_ARROW)) { tractorY += tractorSpeed; moved = true; }

            tractorX = constrain(tractorX, tractorWidth / 2, width - tractorWidth / 2);
            tractorY = constrain(tractorY, tractorHeight / 2, height - tractorHeight / 2);

            if (moved) plantWithTractor();
        }
    }
}
function checkHarvesterCollision() {
    let offsetX = (width - cols * tileSize) / 2;
    let offsetY = (height - rows * tileSize) / 2;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let cellX = i * tileSize + offsetX;
            let cellY = j * tileSize + offsetY;

            if (dist(harvesterX, harvesterY, cellX + tileSize / 2, cellY + tileSize / 2) < tileSize) {
                if (farmGrid[i][j] === STATE_HARVEST) {
                    if (collectedCropInStorage < maxStorageCapacity) {
                        farmGrid[i][j] = STATE_DIRT;
                        collectedCropInStorage++;
                    }
                }
            }
        }
    }
}
function plantWithTractor() {
    if (!selectedCrop) return;

    let offsetX = (width - cols * tileSize) / 2;
    let offsetY = (height - rows * tileSize) / 2;

    let tractorGridX = floor((tractorX - offsetX) / tileSize);
    let tractorGridY = floor((tractorY - offsetY) / tileSize);

    tractorGridX = constrain(tractorGridX, 0, cols - 1);
    tractorGridY = constrain(tractorGridY, 0, rows - 1);

    if (farmGrid[tractorGridX][tractorGridY] === STATE_DIRT) {
        farmGrid[tractorGridX][tractorGridY] = STATE_PLANT;
        plantIsGrowing = true;
    }
}
function checkPlantGrowth() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (farmGrid[i][j] === STATE_PLANT && random() < 0.005) {
                farmGrid[i][j] = STATE_HARVEST;
            }
        }
    }
}
function checkAllCropsPlanted() {
    if (allCropsPlanted) return;

    let plantedCount = 0;
    let totalFarmTiles = 0;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (farmGrid[i][j] === STATE_DIRT || farmGrid[i][j] === STATE_PLANT || farmGrid[i][j] === STATE_HARVEST) {
                totalFarmTiles++;
                if (farmGrid[i][j] === STATE_PLANT || farmGrid[i][j] === STATE_HARVEST) {
                    plantedCount++;
                }
            }
        }
    }

    if (totalFarmTiles === 0) {
        allCropsPlanted = true;
        return;
    }

    if (plantedCount === totalFarmTiles) {
        allCropsPlanted = true;
        console.log("Todas as sementes foram plantadas! Hora de colher!");
    }
}
function checkAllCropsHarvested() {
    if (allCropsHarvested) return;
    if (!allCropsPlanted) return;

    let remainingToHarvest = 0;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (farmGrid[i][j] === STATE_PLANT || farmGrid[i][j] === STATE_HARVEST) {
                remainingToHarvest++;
            }
        }
    }

    if (remainingToHarvest === 0 && collectedCropInStorage === 0 && currentTruckLoad === 0 && !truckActive) {
        allCropsHarvested = true;
        showFarmGrid = false;
        console.log("Todas as culturas foram colhidas e vendidas! Área de plantação removida.");
    }
}
function handleTruckLogic() {
    if (truckShouldAppear && !truckActive) {
        truckActive = true;
        truckX = -truckWidth;
        // Truck enters from the left at the same Y level as the collection point
        truckY = harvestCollectionPoint.y - truckHeight / 2;
        truckDestination = 'collection';
        truckLoadingState = 'moving';
        truckShouldAppear = false;
    }

    if (truckActive) {
        if (truckDestination === 'collection') {
            let targetX = harvestCollectionPoint.x;
            let targetY = harvestCollectionPoint.y - truckHeight / 2;

            if (dist(truckX, truckY, targetX, targetY) > truckSpeed) {
                truckX = lerp(truckX, targetX, truckSpeed / dist(truckX, truckY, targetX, targetY));
                truckY = lerp(truckY, targetY, truckSpeed / dist(truckX, truckY, targetX, targetY));
            } else {
                truckX = targetX;
                truckY = targetY;
                if (truckLoadingState !== 'loading') {
                    truckLoadingState = 'loading';
                    loadTruckFromStorage();
                }
            }
        } else if (truckDestination === 'offscreen') {
            let targetX = width + truckWidth;
            let targetY = truckY;

            if (dist(truckX, truckY, targetX, targetY) > truckSpeed) {
                truckX += truckSpeed;
            } else {
                truckX = targetX;
                truckY = targetY;
                truckActive = false;
                truckLoadingState = 'idle';
                totalMoney += currentTruckLoad * cropValue;
                currentTruckLoad = 0;
            }
        }
    }
}
function loadTruckFromStorage() {
    if (collectedCropInStorage > 0 && currentTruckLoad < truckCapacity) {
        setTimeout(() => {
            collectedCropInStorage--;
            currentTruckLoad++;
            if (collectedCropInStorage > 0 && currentTruckLoad < truckCapacity) {
                loadTruckFromStorage();
            } else {
                truckLoadingState = 'moving';
                truckDestination = 'offscreen';
            }
        }, 300);
    } else {
        truckLoadingState = 'moving';
        truckDestination = 'offscreen';
    }
}
function isAnyCropHarvestable() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (farmGrid[i][j] === STATE_HARVEST) {
                return true;
            }
        }
    }
    return false;
}
function initializeFarmGrid() {
    farmGrid = [];
    for (let i = 0; i < cols; i++) {
        farmGrid[i] = [];
        for (let j = 0; j < rows; j++) {
            farmGrid[i][j] = STATE_DIRT;
        }
    }
}
function resetGameElements() {
    tractorX = width / 2;
    tractorY = height - tileSize * 1.5;
    harvesterX = -harvesterWidth;
    harvesterY = height / 2 + tileSize;
    truckX = -truckWidth;
    truckY = height - tileSize * 1.5;
    currentTruckLoad = 0;
    truckActive = false;
    truckLoadingState = 'idle';
    truckDestination = 'collection';
    collectedCropInStorage = 0;
    controllingHarvester = false;
    allCropsPlanted = false;
    allCropsHarvested = false;
    totalMoney = 0;
    truckShouldAppear = false;
    showFarmGrid = true;
}

// --- Funções para a Tela do Celular ---

function drawCellphoneScreen() {
    background(skyColor); // Fundo do jogo, mas com a tela do celular por cima
    drawClouds(); // Para o cenário ainda ter vida
    drawBirds();  // Para o cenário ainda ter vida

    // Desenha o "fundo" do celular
    fill(50, 50, 50); // Cor escura para o corpo do celular
    let phoneWidth = width * 0.5;
    let phoneHeight = height * 0.8;
    let phoneX = width / 2 - phoneWidth / 2;
    let phoneY = height / 2 - phoneHeight / 2;
    rect(phoneX, phoneY, phoneWidth, phoneHeight, 20); // Retângulo arredondado para o celular

    // Desenha a "tela" do celular
    fill(200, 220, 255); // Cor mais clara para a tela
    let screenPadding = 20;
    let screenX = phoneX + screenPadding;
    let screenY = phoneY + screenPadding;
    let screenWidth = phoneWidth - screenPadding * 2;
    let screenHeight = phoneHeight - screenPadding * 2;
    rect(screenX, screenY, screenWidth, screenHeight, 10);

    // Desenha a pergunta atual
    if (currentQuestionIndex < questions.length) {
        let currentQuestion = questions[currentQuestionIndex];
        fill(0);
        // Ajuste aqui para centralizar a pergunta na tela do celular
        textSize(18);
        textAlign(CENTER, CENTER); // Alinha o texto da pergunta ao centro
        text(currentQuestion.question, screenX + screenWidth / 2, screenY + screenHeight / 3);


        // Desenha os botões de resposta
        let buttonHeight = 40;
        let buttonMargin = 15;
        let startButtonY = screenY + screenHeight / 2;

        answerButtons = [];
        for (let i = 0; i < currentQuestion.options.length; i++) {
            let option = currentQuestion.options[i];
            let btnX = screenX + screenWidth / 2 - 100; // Centraliza o botão
            let btnY = startButtonY + i * (buttonHeight + buttonMargin);
            let btnWidth = 200;

            fill(70, 130, 180); // Azul SteelBlue para os botões
            rect(btnX, btnY, btnWidth, buttonHeight, 5);

            fill(255);
            textSize(14); // Tamanho da fonte das respostas, reduzido para 14
            textAlign(CENTER, CENTER);
            text(option.text, btnX + btnWidth / 2, btnY + buttonHeight / 2);

            // Armazena as propriedades do botão para detecção de clique
            answerButtons.push({ x: btnX, y: btnY, width: btnWidth, height: buttonHeight, value: option.value });
        }
    } else {
        // Todas as perguntas foram respondidas
        fill(0);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Obrigado por suas respostas!", screenX + screenWidth / 2, screenY + screenHeight / 2 - 50);
        textSize(18);
        text("Sua pontuação final: $" + totalMoney, screenX + screenWidth / 2, screenY + screenHeight / 2);

        // Botão para reiniciar o jogo
        let restartBtnX = screenX + screenWidth / 2 - 80;
        let restartBtnY = screenY + screenHeight - 80;
        let restartBtnWidth = 160;
        let restartBtnHeight = 50;

        fill(0, 150, 0); // Verde para o botão de reiniciar
        rect(restartBtnX, restartBtnY, restartBtnWidth, restartBtnHeight, 5);
        fill(255);
        textSize(18);
        text("Reiniciar Jogo", restartBtnX + restartBtnWidth / 2, restartBtnY + restartBtnHeight / 2);

        // Armazena as propriedades do botão de reiniciar
        answerButtons.push({ x: restartBtnX, y: restartBtnY, width: restartBtnWidth, height: restartBtnHeight, value: "restart" });
    }
}

// Função auxiliar para configurar os botões de resposta para a pergunta atual
function setupAnswerButtons() {
    answerButtons = [];
    if (currentQuestionIndex < questions.length) {
        let currentQuestion = questions[currentQuestionIndex];
        let buttonHeight = 40;
        let buttonMargin = 15;
        let phoneWidth = width * 0.5;
        let phoneHeight = height * 0.8;
        let phoneX = width / 2 - phoneWidth / 2;
        let phoneY = height / 2 - phoneHeight / 2;
        let screenPadding = 20;
        let screenX = phoneX + screenPadding;
        let screenY = phoneY + screenPadding;
        let screenWidth = phoneWidth - screenPadding * 2;
        let screenHeight = phoneHeight - screenPadding * 2;
        let startButtonY = screenY + screenHeight / 2;

        for (let i = 0; i < currentQuestion.options.length; i++) {
            let option = currentQuestion.options[i];
            let btnX = screenX + screenWidth / 2 - 100;
            let btnY = startButtonY + i * (buttonHeight + buttonMargin);
            let btnWidth = 200;
            answerButtons.push({ x: btnX, y: btnY, width: btnWidth, height: buttonHeight, value: option.value });
        }
    }
}

function mousePressed() {
    if (currentGameState === GAME_STATE_START_SCREEN) {
        handleTractorColorSelection();
        handleCropSelection();
        if (selectedCrop && selectedTractorColor) {
            currentGameState = GAME_STATE_PLAYING;
        }
    } else if (currentGameState === GAME_STATE_PLAYING) {
        // Verifica se clicou no botão de enviar caminhão
        if (sendTruckButton.visible &&
            mouseX > sendTruckButton.x &&
            mouseX < sendTruckButton.x + sendTruckButton.width &&
            mouseY > sendTruckButton.y &&
            mouseY < sendTruckButton.y + sendTruckButton.height) {
            truckShouldAppear = true;
        }
    } else if (currentGameState === GAME_STATE_CELLPHONE_SCREEN) {
        // Lógica para clicar nos botões da tela do celular
        if (!playerAnswered) { // Apenas permite uma resposta por pergunta
            for (let i = 0; i < answerButtons.length; i++) {
                let btn = answerButtons[i];
                if (mouseX > btn.x && mouseX < btn.x + btn.width &&
                    mouseY > btn.y && mouseY < btn.y + btn.height) {

                    if (currentQuestionIndex < questions.length) {
                        // Se clicou em um botão de resposta
                        let currentQuestion = questions[currentQuestionIndex];
                        // Execute a ação associada à resposta
                        currentQuestion.action(btn.value);

                        playerAnswered = true; // Marca que a pergunta foi respondida
                        // Passa para a próxima pergunta após um pequeno atraso
                        setTimeout(() => {
                            currentQuestionIndex++;
                            playerAnswered = false; // Resetar para a próxima pergunta
                            // Se houver mais perguntas, configurar os botões para a próxima
                            if (currentQuestionIndex < questions.length) {
                                setupAnswerButtons();
                            }
                        }, 500); // 0.5 segundo de atraso
                    } else if (btn.value === "restart") {
                        // Se clicou no botão de reiniciar jogo
                        restartGame();
                    }
                    return; // Sai da função após o clique ser processado
                }
            }
        } else { // Se já respondeu, não permite mais cliques até a próxima pergunta
            // Adicione um feedback visual ou mensagem se quiser
            // console.log("Você já respondeu a esta pergunta!");
        }

    }
}

function handleTractorColorSelection() {
    let colorBoxSize = width * 0.08;
    let startX = width / 2 - (tractorColors.length * (colorBoxSize + width * 0.04)) / 2;
    let startY = height / 2 - height * 0.04;

    for (let i = 0; i < tractorColors.length; i++) {
        let x = startX + i * (colorBoxSize + width * 0.04);
        let y = startY;

        if (mouseX >= x && mouseX <= x + colorBoxSize &&
            mouseY >= y && mouseY <= y + colorBoxSize) {
            selectedTractorColor = tractorColors[i];
            return;
        }
    }
}
function handleCropSelection() {
    let buttonWidth = width * 0.2;
    let buttonHeight = height * 0.04;
    let padding = width * 0.03;
    let totalWidth = cropOptions.length * (buttonWidth + padding) - padding;
    let startX = width / 2 - totalWidth / 2;
    let startY = height / 2 + height * 0.25;

    for (let i = 0; i < cropOptions.length; i++) {
        let x = startX + i * (buttonWidth + padding);
        let y = startY;

        if (mouseX >= x && mouseX <= x + buttonWidth &&
            mouseY >= y && mouseY <= y + buttonHeight) {
            selectedCrop = cropOptions[i];
            return;
        }
    }
}
function keyPressed() {
    if (currentGameState === GAME_STATE_START_SCREEN) {
        if (selectedCrop && selectedTractorColor) {
            currentGameState = GAME_STATE_PLAYING;
        }
    }

    if (currentGameState === GAME_STATE_PLAYING) {
        if (key === 'h' || key === 'H') {
            controllingHarvester = !controllingHarvester;
        }
    }
}
function restartGame() {
    currentGameState = GAME_STATE_START_SCREEN;
    initializeFarmGrid();
    resetGameElements();
    initializeClouds();
    initializeBirds(); // Re-initialize birds on restart
    allCropsPlanted = false;
    allCropsHarvested = false;
    selectedCrop = null;
    selectedTractorColor = tractorColors[0];
    showCellphone = false; // Resetar o estado do celular
    currentQuestionIndex = 0; // Resetar o índice da pergunta
    playerAnswered = false; // Resetar o estado de resposta
}
function windowResized() {
    let newCanvasWidth = windowWidth;
    let newCanvasHeight = windowHeight;

    if (windowWidth > 850) {
        newCanvasWidth = 750;
        newCanvasHeight = 600;
    }

    resizeCanvas(newCanvasWidth, newCanvasHeight);

    cols = floor((width - tileSize * 4) / tileSize);
    rows = floor((height - tileSize * 4) / tileSize);

    // Ponto de coleta
    harvestCollectionPoint = {
        x: 120, // Adjusted X coordinate
        y: newCanvasHeight - tileSize * 0.8 // Adjusted Y coordinate
    };

    initializeFarmGrid();
    resetGameElements();
    initializeClouds();
    initializeBirds(); // Re-initialize birds on window resize
}