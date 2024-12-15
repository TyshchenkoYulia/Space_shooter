import { Application, Assets, Graphics, Sprite, Text } from "pixi.js";
import "./style.css";

const canvas = document.getElementById("canvas");
const startButton = document.getElementById("start-button");
const bullets = document.getElementById("bullets");
const timer = document.getElementById("timer");

const app = new Application();

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

  await setupSpaceShip(spaceship, app);

  // return spaceship;
}

// додаємо управління рухом корабля
async function setupSpaceShip(spaceship, app) {
  let moveLeft = false;
  let moveRight = false;
  const shipSpeed = 8;

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

let asteroidsLeft = [];
const asteroidCount = 5;

async function addAsteroids(imageAsteroid) {
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
  let timeleft = 10;
  timer.textContent = `Time: ${timeleft}`;

  const timerInterval = setInterval(() => {
    timeleft--;

    timer.textContent = `Time: ${timeleft}`;

    if (timeleft <= 0) {
      setTimeout(() => {
        removeAsteroids(app);
      }, 1000);

      setTimeout(() => {
        addLoseText(app);
      }, 1500);

      clearInterval(timerInterval);

      console.log("finish timer");
    }
  }, 1000);
}

// створюємо кулі
const countBullets = [];
const maxBullets = 3;
let bulletsleft = maxBullets;

async function addBullets() {
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
function fireBullet(spaceship) {
  if (!spaceship) {
    return;
  }

  if (bulletsleft <= 0) {
    console.log("bullets finished");

    setTimeout(() => {
      removeAsteroids(app);
    }, 1000);

    setTimeout(() => {
      addLoseText(app);
    }, 1500);

    return;
  }
  const availableBullet = countBullets.find((bullet) => !bullet.visible);

  if (availableBullet) {
    availableBullet.visible = true;
    bulletsleft--;
    bullets.textContent = `Bullets: ${bulletsleft} / ${maxBullets}`;

    // console.log(spaceship.x);

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

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    fireBullet();
  }
});

// створюємо текст
function addLoseText(app) {
  const loseText = new Text({
    text: "YOU LOSE",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: 700,
      fill: "rgb(164, 6, 6)",
    },
  });

  loseText.x = app.screen.width / 2 - loseText.width / 2;
  loseText.y = app.screen.height / 2 - loseText.height / 2;

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

// ініціалізуємо початок гри
startButton.addEventListener("click", () => {
  startButton.classList.toggle("hidden");

  setTimeout(() => {
    startButton.style.display = "none";
    onStartGame();
  }, 500);
});

async function onStartGame() {
  console.log("game started");

  await addAsteroids("/src/img/asteroid.png");
  await startTimer();
  await addBullets();
}
