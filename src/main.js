import {
  Application,
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
let isStartGame = false;

const starCount = 100;

let spaceship = null;
const shipSpeed = 4;
let moveLeft = false;
let moveRight = false;

const asteroidsLeft = [];
const asteroidCount = 1;

let countBullets = [];
const maxBullets = 10;
let bulletsleft = 10;

let timeleft = 60;
let timerInterval = null;

let restartButton;

let boss;
const bossSpeed = 1;
let bossDirection = 1;
let bossPoint = 4;
let lifePoint;
let lifePointBar;
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
  onClickStartGameButton();
  onClickNextLevelButton();
})();

// =======================================================================

//  додаємо background
async function addBackground(imageBg) {
  const bgTexture = await Assets.load(imageBg);
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);
}

// додаємо зірки на background
async function addStars() {
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
}

// додаємо космічний корабель
async function addSpaceShip(imageSpaceShipe) {
  const spaceshipTexture = await Assets.load(imageSpaceShipe);
  spaceship = new Sprite(spaceshipTexture);
  spaceship.anchor.set(0.5);
  spaceship.width = 100;
  spaceship.height = 120;
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height - spaceship.height / 2;
  app.stage.addChild(spaceship);
}

// додаємо управління рухом корабля
function setupSpaceShip() {
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
  // isStartGame = true;

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
}

// Видалення всіх астероїдів при закінченні гри
function removeAsteroids(app) {
  // console.log("remove asteroids");

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
  timer.textContent = `Time: ${timeleft}`;

  const timerInterval = setInterval(() => {
    timeleft--;

    timer.textContent = `Time: ${timeleft}`;

    if (timeleft <= 0) {
      clearInterval(timerInterval);
      onEndLoseGame();

      // console.log("finish timer");
    }

    if (bulletsleft <= 0) {
      clearInterval(timerInterval);
    }

    if (asteroidsLeft <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// створюємо кулі
function addBullets() {
  for (let i = 0; i < maxBullets; i++) {
    const bullet = new Graphics().circle(0, 0, 8).fill("rgb(164, 6, 6)");

    bullet.x = app.screen.width / 2;
    bullet.y = app.screen.height - 60;
    bullet.visible = false;

    app.stage.addChild(bullet);
    countBullets.push(bullet);
  }
}

// додаємо логіку пострілів
function fireBullet() {
  if (!spaceship) {
    return;
  }

  if (bulletsleft <= 0) {
    // console.log("bullets finished");
    onEndLoseGame();

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
      availableBullet.y -= 10;

      if (availableBullet.y < 0) {
        clearInterval(bulletInterval);
        availableBullet.visible = false;
      }
    }, 20);
  }
}

// кнопка Start New Game
function onClickStartGameButton() {
  isStartGame = true;

  startButton.addEventListener("click", () => {
    startButton.classList.toggle("hidden");

    setTimeout(() => {
      startButton.style.display = "none";
      onStartGame();
    }, 500);

    setTimeout(() => {
      resetGameState();
    }, 1000);
  });
}

function restartGameButton() {
  startButton.classList.remove("hidden");
  startButton.style.display = "block";
}

// кнопка Next Level
function onClickNextLevelButton() {
  nextLevelButton.addEventListener("click", () => {
    nextLevelButton.classList.add("hidden");
    nextLevelButton.style.display = "none";

    onNextLevel();
  });
}

// створюємо текст
function addLoseText(app) {
  // isStartGame = false;

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

  setTimeout(() => {
    app.stage.removeChild(loseText);
  }, 2000);
}

function addWinText(app) {
  // isStartGame = false;

  const winText = new Text({
    text: "YOU WIN",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: 700,
      fill: "rgb(7, 120, 141)",
    },
  });

  winText.x = app.screen.width / 2 - 120;
  winText.y = (0.3 * app.screen.height) / 2;

  app.stage.addChild(winText);

  setTimeout(() => {
    app.stage.removeChild(winText);
  }, 2000);
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
  isStartGame = true;
  // console.log("game started");

  isStartGame = true;
  setupSpaceShip();
  firstLevelText();

  setTimeout(() => {
    addAsteroids("/src/img/asteroid.png");
    addBullets();
  }, 1500);

  app.ticker.add(() => {
    checkCollisions(app);
  });
}

// кінець гри
function onEndLoseGame() {
  setTimeout(() => {
    removeAsteroids(app);
    clearInterval(timerInterval);
  }, 1000);

  setTimeout(() => {
    addLoseText(app);
  }, 1500);

  restartButton = setTimeout(() => {
    restartGameButton();
  }, 2000);
}

function onEndWinGame() {
  setTimeout(() => {
    addWinText(app);
    clearInterval(timerInterval);
  }, 1500);

  setTimeout(() => {
    nextLevelButton.classList.remove("hidden");
  }, 2000);
}

// описуємо логіку попадання в астероїд
function isRectCollision(rect1, rect2) {
  if (!rect1 || !rect2) return false;
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

          if (asteroidsLeft.length === 0) {
            // console.log("win");

            onEndWinGame();
          }
        }
      });
    }
  });
}

// скидаємо таймер і кулі на початковий стан
function resetGameState() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timeleft = 60;
  timer.textContent = `Time: ${timeleft}`;

  timerInterval = setInterval(() => {
    timeleft--;
    timer.textContent = `Time: ${timeleft}`;

    if (timeleft <= 0) {
      clearInterval(timerInterval);
      onEndLoseGame();
    }

    if (bulletsleft <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);

  // .............................................

  bulletsleft = maxBullets;
  bullets.textContent = `Bullets: ${bulletsleft} / ${maxBullets}`;
  countBullets.forEach((bullet) => {
    bullet.visible = false;
    bullet.y = app.screen.height - 60;
  });
}

//=============================== start level 2 ===================================

function onNextLevel() {
  // console.log("next level started");

  setTimeout(() => {
    secondLevelText();
    resetGameState(app);
  }, 1000);

  setTimeout(() => {
    addBoss("/src/img/boss.webp");
    addBullets();
  }, 1500);

  app.ticker.add(() => {
    if (boss) {
      checkBossCollision();
    }
  });
}

// Додаємо боса
async function addBoss(imageBoss) {
  const bossTexture = await Assets.load(imageBoss);
  boss = new Sprite(bossTexture);
  boss.anchor.set(0.5);
  boss.width = 100;
  boss.height = 100;
  boss.x = app.screen.width / 2;
  boss.y = app.screen.height - boss.height / 2 - 500;

  app.stage.addChild(boss);

  setTimeout(() => {
    addLivePointBoss();
    moveBoss();
    shootBossBullet();
  }, 2000);
}

// додаємо шкалу життя
function addLivePointBoss() {
  lifePointBar = new Container();
  const lifePointWidth = 20;
  const lifePointCount = 4;

  for (let i = 0; i < lifePointCount; i++) {
    lifePoint = new Graphics();

    lifePoint.rect(0, 0, lifePointWidth, 10);
    lifePoint.fill("rgb(164, 6, 6)");

    lifePoint.x = i * (lifePointWidth + 5);
    lifePointBar.addChild(lifePoint);
  }

  lifePointBar.x = boss.x - (lifePointCount * (lifePointWidth + 5)) / 2;
  lifePointBar.y = boss.y - boss.height / 2 - 20;
  app.stage.addChild(lifePointBar);
}

// Оновлення шкали поінтів
function updateBossPoints() {
  const currentPoints = lifePointBar.children;
  if (currentPoints.length > bossPoint) {
    lifePointBar.removeChildAt(currentPoints.length - 1);
  }
}

// додаємо логіку руху боса
function moveBoss() {
  app.ticker.add(() => {
    if (!boss) {
      return;
    }

    boss.x += bossDirection * bossSpeed;

    if (
      boss.x >= app.screen.width - boss.width / 2 ||
      boss.x <= boss.width / 2
    ) {
      bossDirection *= -1;
    }

    lifePointBar.x = boss.x - lifePointBar.width / 2;
    lifePointBar.y = boss.y - boss.height / 2 - 20;
  });
}

let bossBullet;

// додаємо логіку пострілів боса
function shootBossBullet() {
  setInterval(() => {
    if (!boss) {
      return;
    }

    bossBullet = new Graphics().circle(0, 0, 8).fill("ffff00");
    bossBullet.width = 20;
    bossBullet.height = 20;
    bossBullet.x = boss.x;
    bossBullet.y = boss.y + boss.height / 2;

    app.stage.addChild(bossBullet);

    const bossBulletInterval = setInterval(() => {
      bossBullet.y += 5;

      if (bossBullet.y > app.screen.height) {
        clearInterval(bossBulletInterval);
        app.stage.removeChild(bossBullet);
        return;
      }
      if (bulletsleft <= 0) {
        setInterval(() => {
          clearInterval(bossBulletInterval);
          app.stage.removeChild(bossBullet);

          stopBoss();
        }, 500);
      }

      // Зіткнення з кулями корабля
      countBullets.forEach((bullet) => {
        if (
          bossBullet &&
          bullet.visible &&
          isRectCollision(bossBullet, bullet)
        ) {
          bullet.visible = false;
          clearInterval(bossBulletInterval);

          if (app.stage.children.includes(bullet)) {
            app.stage.removeChild(bullet);
          }
          if (app.stage.children.includes(bossBullet)) {
            app.stage.removeChild(bossBullet);
          }

          bullet.x = app.screen.width / 2;
          bullet.y = app.screen.height - 60;
        }
      });

      // Зіткнення куль боса з кораблем
      if (bossBullet && isRectCollision(bossBullet, spaceship)) {
        onEndLoseGame();
        clearInterval(bossBulletInterval);
        app.stage.removeChild(bossBullet);
        app.stage.removeChild(spaceship);
        stopBoss();
        clearTimeout(restartButton);
      }
    }, 100);
  }, 2000);
}

// додаємо логіку гри корабля з босом
function checkBossCollision() {
  countBullets.forEach((bullet) => {
    if (bullet.visible && isRectCollision(bullet, boss)) {
      bullet.visible = false;
      bullet.x = app.screen.width / 2;
      bullet.y = app.screen.height - 60;

      // Зменшуємо поінти боса
      bossPoint -= 1;
      updateBossPoints();

      if (bossPoint <= 0) {
        setTimeout(() => {
          app.stage.removeChild(boss);
          app.stage.removeChild(lifePointBar);
          app.stage.removeChild(bossBullet);
          app.stage.removeChild(spaceship);
          boss = null;
          onEndWinGame();
        }, 1000);
      }
    }
  });
}

// зупиняємо боса
function stopBoss() {
  setTimeout(() => {
    if (boss) {
      app.stage.removeChild(boss);
      app.stage.removeChild(lifePointBar);
      boss = null;
    }
  }, 1000);
}
