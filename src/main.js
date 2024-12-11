import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  TextStyle,
} from "pixi.js";
import { Button } from "@pixi/ui";
import "./style.css";

// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");

(async () => {
  const app = new Application();

  await app.init({
    width: 1280,
    height: 720,
    resizeTo: window,
  });
  document.body.appendChild(app.canvas);

  //  додаємо background
  const bgTexture = await Assets.load("/src/img/starry-sky.png");
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // додаємо космічний корабель
  const spaceshipTexture = await Assets.load("./src/img/spaceship.png");
  const spaceship = new Sprite(spaceshipTexture);
  spaceship.anchor.set(0.5);
  spaceship.width = 100;
  spaceship.height = 160;
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height - spaceship.height / 2;
  app.stage.addChild(spaceship);

  // додаємо зірки на background
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

  // додаємо астероїди
  const asteroidTexture = await Assets.load("/src/img/asteroid.png");

  // asteroid.x = app.screen.width / 2;
  // asteroid.y = spaceship.height / 2;

  function createAsteroid() {
    const asteroid = new Sprite(asteroidTexture);
    asteroid.anchor.set(0.5);
    asteroid.width = 50;
    asteroid.height = 60;
    asteroid.x = Math.random() * app.screen.width;
    asteroid.y = Math.random() * (app.screen.height - 200);

    return asteroid;
  }
  function addRandomAsteroids(count) {
    for (let i = 0; i < count; i++) {
      const asteroid = createAsteroid();
      app.stage.addChild(asteroid);
    }
  }

  addRandomAsteroids(5);

  // const asteroidCount = 5;
  // const asteroidGraphics = new Graphics();

  // for (let index = 0; index < asteroidCount; index++) {
  //   const x = (index * 0.78695 * app.screen.width) % app.screen.width;
  //   const y = (index * 0.9382 * app.screen.height) % app.screen.height;
  //   const radius = 2 + Math.random() * 26;
  //   const rotation = Math.random() * Math.PI * 2;

  //   asteroidGraphics
  //     .star(x, y, 5, radius, 0, rotation)
  //     .fill({ color: "red", alpha: radius / 5 });
  // }
  // app.stage.addChild(asteroidGraphics);
})();
