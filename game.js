const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Draw a player square
const player = {
  x: 400,
  y: 500,
  width: 40,
  height: 40,
  color: "cyan"
};

function draw() {
  // Clear screen
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Game loop
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
