import {
  Application,
  applyStyleParams,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
} from "pixi.js";
import "./style.css";

const canvas = document.getElementById("canvas");
const startButton = document.getElementById("start-button");
const nextLevelButton = document.getElementById("nextLevel-button");
const bullets = document.getElementById("bullets");
const timer = document.getElementById("timer");

const app = new Application();

// =====================================================================

let moveLeft = false;
let moveRight = false;
const shipSpeed = 4;
const asteroidsLeft = [];
const asteroidCount = 5;
let asteroidsAdded = false;
const countBullets = [];
const maxBullets = 10;
let bulletsleft = maxBullets;
let isLoseText = false;
let isStartGame = false;
let isEndedGame = false;

// =====================================================================

(async () => {
  await app.init({
    canvas: canvas,
    width: canvas.width,
    height: canvas.height,
    // resizeTo: window,
  });

  await addBackground("/src/img/starry-sky.png");
  await addStars();
  await addSpaceShip("./src/img/spaceship.png");
  await onClickStartGameButton();
  // onClickNextLevelButton();
})();

// =======================================================================

//  додаємо background
async function addBackground(imageBg) {
  const bgTexture = await Assets.load(imageBg);
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // return background;
}

// додаємо зірки на background
async function addStars() {
  const starCount = 100;
  const starsGraphics = new Graphics();

  for (let index = 0; index < starCount; index++) {
    const x = (index * 0.78695 * app.screen.width) % app.screen.width;
    const y = (index * 0.9382 * app.screen.height) % app.screen.height;
    const radius = 2 + Math.random() * 6;
    const rotation = Math.random() * Math.PI * 2;

    starsGraphics
      .star(x, y, 5, radius, 0, rotation)
      .fill({ color: "#cbebea", alpha: radius / 5 });
  }

  app.stage.addChild(starsGraphics);

  // return starsGraphics;
}

// додаємо космічний корабель
async function addSpaceShip(imageSpaceShipe) {
  const spaceshipTexture = await Assets.load(imageSpaceShipe);
  const spaceship = new Sprite(spaceshipTexture);
  spaceship.anchor.set(0.5);
  spaceship.width = 100;
  spaceship.height = 120;
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height - spaceship.height / 2;
  app.stage.addChild(spaceship);

  // console.log(asteroidsAdded);
  // console.log(isEndedGame);
  // console.log(isStartGame);
  // console.log();
  // console.log();

  await setupSpaceShip(spaceship, app);
}

// додаємо управління рухом корабля

async function setupSpaceShip(spaceship, app) {
  window.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
      moveLeft = true;
    }
    if (event.code === "ArrowRight") {
      moveRight = true;
    }
    if (event.code === "Space") {
      fireBullet(spaceship, app);
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") {
      moveLeft = false;
    }
    if (event.code === "ArrowRight") {
      moveRight = false;
    }
  });

  app.ticker.add(() => {
    if (moveLeft && spaceship.x > spaceship.width / 2) {
      spaceship.x -= shipSpeed;
    }
    if (moveRight && spaceship.x < app.screen.width - spaceship.width / 2) {
      spaceship.x += shipSpeed;
    }
  });
}

// додаємо астероїди
async function addAsteroids(imageAsteroid) {
  isStartGame = true;

  const asteroidTexture = await Assets.load(imageAsteroid);

  function createAsteroid() {
    const asteroid = new Sprite(asteroidTexture);
    asteroid.anchor.set(0.5);
    asteroid.width = 50;
    asteroid.height = 60;

    asteroid.x = Math.random() * (app.screen.width - 100) + 50;
    asteroid.y = Math.random() * (app.screen.height - 200) + 50;

    return asteroid;
  }

  function addRandomAsteroids(count) {
    for (let i = 0; i < count; i++) {
      const asteroid = createAsteroid();
      app.stage.addChild(asteroid);
      asteroidsLeft.push(asteroid);
    }
  }
  addRandomAsteroids(asteroidCount);
  asteroidsAdded = true;
}

// Видалення всіх астероїдів при закінченні гри
function removeAsteroids(app) {
  console.log("remove asteroids", asteroidsLeft);

  if (asteroidsLeft.length > 0) {
    asteroidsLeft.forEach((asteroid) => {
      if (app.stage.children.includes(asteroid)) {
        app.stage.removeChild(asteroid);
      }
    });
    asteroidsLeft.length = 0;
  }
}

// додаємо логіку таймера
async function startTimer() {
  let timeleft = 60;
  timer.textContent = `Time: ${timeleft}`;

  const timerInterval = setInterval(() => {
    timeleft--;

    timer.textContent = `Time: ${timeleft}`;

    if (timeleft <= 0) {
      onEndGame();

      clearInterval(timerInterval);

      console.log("finish timer");
    }

    if (bulletsleft <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// створюємо кулі
async function addBullets() {
  for (let i = 0; i < maxBullets; i++) {
    const bullet = new Graphics().circle(0, 0, 8).fill("rgb(164, 6, 6)");

    bullet.x = app.screen.width / 2;
    bullet.y = app.screen.height - 60;
    bullet.visible = false;
    // console.log(countBullets);

    app.stage.addChild(bullet);
    countBullets.push(bullet);
  }
}

// додаємо логіку пострілів
function fireBullet(spaceship) {
  if (!spaceship) {
    return;
  }

  if (bulletsleft <= 0) {
    console.log("bullets finished");

    onEndGame();
    return;
  }

  const availableBullet = countBullets.find((bullet) => !bullet.visible);

  if (availableBullet) {
    availableBullet.visible = true;
    bulletsleft--;
    bullets.textContent = `Bullets: ${bulletsleft} / ${maxBullets}`;

    availableBullet.x = spaceship.x;
    availableBullet.y = spaceship.y - 50;

    const bulletInterval = setInterval(() => {
      availableBullet.y -= 5;

      if (availableBullet.y < 0) {
        clearInterval(bulletInterval);
        availableBullet.visible = false;
      }
    }, 20);
  }
}

// кнопка Start New Game
async function onClickStartGameButton() {
  isStartGame = true;
  asteroidsAdded = true;

  startButton.addEventListener("click", () => {
    startButton.classList.toggle("hidden");

    setTimeout(() => {
      startButton.style.display = "none";
      onStartGame();
    }, 500);
  });
}

function restartGameButton() {
  startButton.classList.remove("hidden");
  startButton.style.display = "block";

  startButton.onclick = () => {
    if (isLoseText) {
      location.reload();
    }
  };
}

// кнопка Next Level
async function onClickNextLevelButton() {
  nextLevelButton.addEventListener("click", () => {
    nextLevelButton.classList.toggle("hidden");

    setTimeout(() => {
      nextLevelButton.style.display = "none";
      onNextLevel();
    }, 500);
  });
}
// створюємо текст
function addLoseText(app) {
  isLoseText = true;

  const loseText = new Text({
    text: "YOU LOSE",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: 700,
      fill: "rgb(164, 6, 6)",
    },
  });

  loseText.x = app.screen.width / 2 - 150;
  loseText.y = (0.3 * app.screen.height) / 2;

  app.stage.addChild(loseText);
}

function addWinText(app) {
  const winText = new Text({
    text: "YOU WIN",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: 700,
      fill: "rgb(7, 120, 141)",
    },
  });

  winText.x = app.screen.width / 2 - winText.width / 2;
  winText.y = app.screen.height / 2 - winText.height / 2;

  app.stage.addChild(winText);
}
// додаємо текс рівнів
function firstLevelText() {
  const level1Text = new Text({
    text: "LEVEL 1",
    style: {
      fontFamily: "Arial",
      fontSize: 84,
      fontWeight: 700,
      fill: "rgb(7, 120, 141)",
    },
  });

  level1Text.x = app.screen.width / 2 - 150;
  level1Text.y = app.screen.height / 2 - 50;
  app.stage.addChild(level1Text);

  setTimeout(() => {
    app.stage.removeChild(level1Text);
  }, 2000);
}

function secondLevelText() {
  const level2Text = new Text({
    text: "LEVEL 2",
    style: {
      fontFamily: "Arial",
      fontSize: 84,
      fontWeight: 700,
      fill: "rgb(7, 120, 141)",
    },
  });

  level2Text.x = app.screen.width / 2 - 150;
  level2Text.y = app.screen.height / 2 - 50;
  app.stage.addChild(level2Text);

  setTimeout(() => {
    app.stage.removeChild(level2Text);
  }, 2000);
}

// ініціалізуємо початок гри / level 1
async function onStartGame() {
  // isStartGame = true;
  console.log("game started");

  firstLevelText();

  setTimeout(() => {
    addAsteroids("/src/img/asteroid.png");
    startTimer();
    addBullets();
  }, 1500);

  app.ticker.add(() => {
    checkCollisions(app);
  });
}

// кінець гри
function onEndGame() {
  isEndedGame = true;

  setTimeout(() => {
    removeAsteroids(app);
  }, 1000);

  setTimeout(() => {
    addLoseText(app);
  }, 1500);

  setTimeout(() => {
    restartGameButton();
  }, 1500);
}

// описуємо логіку попадання в астероїд
function isRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkCollisions(app) {
  countBullets.forEach((bullet) => {
    if (bullet.visible) {
      asteroidsLeft.forEach((asteroid, index) => {
        if (isRectCollision(bullet, asteroid)) {
          app.stage.removeChild(asteroid);
          asteroidsLeft.splice(index, 1);

          bullet.visible = false;
          bullet.y = app.screen.height - 60;
        }
      });
    }
  });
}

// start level 2
async function onNextLevel(params) {
  console.log("next level started");

  secondLevelText();
  setTimeout(() => {
    addBoss("/src/img/boss.webp");

    startTimer();
    addBullets();
  }, 1500);
}

// додаємо boss
async function addBoss(imageBoss) {
  const bossTexture = await Assets.load(imageBoss);
  const boss = new Sprite(bossTexture);
  boss.anchor.set(0.5);
  boss.width = 100;
  boss.height = 100;
  boss.x = app.screen.width / 2;
  boss.y = app.screen.height - boss.height / 2 - 500;

  app.stage.addChild(boss);

  // додаємо шкалу життя
  function addLivePointBoss() {
    if (!app) {
      console.error("Application or app is not defined");
      return;
    }
    const lifePointBar = new Container();
    const lifePointWidth = 20;
    const lifePointCount = 4;

    for (let i = 0; i < lifePointCount; i++) {
      const lifePoint = new Graphics();

      lifePoint.rect(0, 0, lifePointWidth, 10);
      lifePoint.fill("rgb(164, 6, 6)");

      lifePoint.x = i * (lifePointWidth + 5);
      lifePointBar.addChild(lifePoint);
    }

    lifePointBar.x = boss.x - (lifePointCount * (lifePointWidth + 5)) / 2;
    lifePointBar.y = boss.y - boss.height / 2 - 20;

    app.stage.addChild(lifePointBar);
  }

  addLivePointBoss();
}
