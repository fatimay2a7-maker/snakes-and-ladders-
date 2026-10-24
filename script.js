$(".board").empty();
for (let row = 0; row < 10; row++) {
  for (let column = 0; column < 10; column++) {
    let number;
    if (row % 2 === 0) {
      number = 100 - row * 10 - column;
    } else {
      number = 91 - row * 10 + column;
    }

    let cellClass;
    if (number % 2 === 0) {
      cellClass = "cell-even";
    } else {
      cellClass = "cell-odd";
    }
    $(".board").append(
      `<div data-number='${number}' class="cell ${cellClass}">${number}</div>`,
    );
  }
}
let ladders = {
  2: 37,
  4: 14,
  9: 31,
  28: 84,
  21: 42,
  61: 79,
  72: 91,
  67: 51,
};

let snakes = {
  17: 7,
  35: 15,
  54: 34,
  87: 36,
  64: 60,
  98: 43,
  95: 75,
  92: 73,
};
function getCellCenter(number) {
  const cell = document.querySelector(`.cell[data-number="${number}"]`);

  const board = document.querySelector(".board");

  const cellRect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  return {
    x: cellRect.left - boardRect.left + cellRect.width / 2,
    y: cellRect.top - boardRect.top + cellRect.height / 2,
  };
}

const boardElement = document.querySelector(".board");
const svgNS = "http://www.w3.org/2000/svg";

// ساخت لایه‌ی نقاشی روی تخته
const boardSvg = document.createElementNS(svgNS, "svg");

boardSvg.setAttribute("class", "board-art");
boardSvg.setAttribute(
  "viewBox",
  `0 0 ${boardElement.clientWidth} ${boardElement.clientHeight}`,
);
boardSvg.setAttribute("preserveAspectRatio", "none");

boardElement.appendChild(boardSvg);

// ساخت خط SVG
function drawLine(group, x1, y1, x2, y2, color, width) {
  const line = document.createElementNS(svgNS, "line");

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", width);
  line.setAttribute("stroke-linecap", "round");

  group.appendChild(line);
}

// رسم نردبان بین دو خانه
function drawLadder(from, to) {
  const start = getCellCenter(from);
  const end = getCellCenter(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  // فاصله‌ی دو ریل از یکدیگر
  const halfWidth = Math.min((boardElement.clientWidth / 10) * 0.17, 13);

  const px = (-dy / length) * halfWidth;
  const py = (dx / length) * halfWidth;

  const group = document.createElementNS(svgNS, "g");

  // ریل‌های نردبان
  drawLine(
    group,
    start.x + px,
    start.y + py,
    end.x + px,
    end.y + py,
    "#78350f",
    11,
  );

  drawLine(
    group,
    start.x - px,
    start.y - py,
    end.x - px,
    end.y - py,
    "#78350f",
    11,
  );

  drawLine(
    group,
    start.x + px,
    start.y + py,
    end.x + px,
    end.y + py,
    "#d97706",
    6,
  );

  drawLine(
    group,
    start.x - px,
    start.y - py,
    end.x - px,
    end.y - py,
    "#d97706",
    6,
  );

  // پله‌های نردبان
  const rungCount = Math.max(
    4,
    Math.round(length / ((boardElement.clientWidth / 10) * 0.65)),
  );

  for (let i = 1; i < rungCount; i++) {
    const t = i / rungCount;
    const x = start.x + dx * t;
    const y = start.y + dy * t;

    drawLine(group, x + px, y + py, x - px, y - py, "#78350f", 8);

    drawLine(group, x + px, y + py, x - px, y - py, "#fbbf24", 4);
  }

  boardSvg.appendChild(group);
}

// رسم مار خمیده بین دو خانه
function drawSnake(from, to, color, lightColor) {
  const start = getCellCenter(from);
  const end = getCellCenter(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  // ایجاد چند خم در مسیر مار
  const bend = Math.min((boardElement.clientWidth / 10) * 0.32, 25);

  const px = (-dy / length) * bend;
  const py = (dx / length) * bend;

  const pathData = [
    `M ${start.x} ${start.y}`,
    `C ${start.x + px} ${start.y + py},`,
    `${start.x - px} ${start.y + dy * 0.25},`,
    `${start.x + dx * 0.33} ${start.y + dy * 0.33}`,
    `S ${start.x + dx * 0.72 - px} ${start.y + dy * 0.72 + py},`,
    `${end.x} ${end.y}`,
  ].join(" ");

  const group = document.createElementNS(svgNS, "g");

  // حاشیه‌ی تیره‌ی بدن
  const outline = document.createElementNS(svgNS, "path");
  outline.setAttribute("d", pathData);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#14532d");
  outline.setAttribute("stroke-width", 22);
  outline.setAttribute("stroke-linecap", "round");
  outline.setAttribute("stroke-linejoin", "round");

  group.appendChild(outline);

  // رنگ اصلی بدن
  const body = document.createElementNS(svgNS, "path");
  body.setAttribute("d", pathData);
  body.setAttribute("fill", "none");
  body.setAttribute("stroke", color);
  body.setAttribute("stroke-width", 16);
  body.setAttribute("stroke-linecap", "round");
  body.setAttribute("stroke-linejoin", "round");

  group.appendChild(body);

  // لکه‌های رنگی روی بدن
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;

    const x = start.x + dx * t + Math.sin(t * Math.PI * 4) * px * 0.45;

    const y = start.y + dy * t + Math.sin(t * Math.PI * 4) * py * 0.45;

    const spot = document.createElementNS(svgNS, "circle");

    spot.setAttribute("cx", x);
    spot.setAttribute("cy", y);
    spot.setAttribute("r", 3.5);
    spot.setAttribute("fill", lightColor);

    group.appendChild(spot);
  }

  // سر مار در خانه‌ی شروع
  const head = document.createElementNS(svgNS, "circle");
  head.setAttribute("cx", start.x);
  head.setAttribute("cy", start.y);
  head.setAttribute("r", 12);
  head.setAttribute("fill", color);
  head.setAttribute("stroke", "#14532d");
  head.setAttribute("stroke-width", 2);

  group.appendChild(head);

  // چشم‌ها
  for (const eyeOffset of [-5, 5]) {
    const eye = document.createElementNS(svgNS, "circle");

    eye.setAttribute("cx", start.x + eyeOffset);
    eye.setAttribute("cy", start.y - 4);
    eye.setAttribute("r", 4);
    eye.setAttribute("fill", "white");

    group.appendChild(eye);

    const pupil = document.createElementNS(svgNS, "circle");

    pupil.setAttribute("cx", start.x + eyeOffset);
    pupil.setAttribute("cy", start.y - 3);
    pupil.setAttribute("r", 1.4);
    pupil.setAttribute("fill", "#172554");

    group.appendChild(pupil);
  }
  // لبخند مار
  const smile = document.createElementNS(svgNS, "path");

  smile.setAttribute(
    "d",
    `M ${start.x - 4} ${start.y + 4} Q ${start.x} ${start.y + 8} ${start.x + 4} ${start.y + 4}`,
  );

  smile.setAttribute("fill", "none");
  smile.setAttribute("stroke", "#14532d");
  smile.setAttribute("stroke-width", 1.5);
  smile.setAttribute("stroke-linecap", "round");

  group.appendChild(smile);

  // زبان کوچک
  const tongue = document.createElementNS(svgNS, "path");
  tongue.setAttribute(
    "d",
    `M ${start.x} ${start.y + 10}
     l 0 5 l -3 3 m 3 -3 l 3 3`,
  );
  tongue.setAttribute("fill", "none");
  tongue.setAttribute("stroke", "#fb7185");
  tongue.setAttribute("stroke-width", 2);
  tongue.setAttribute("stroke-linecap", "round");

  group.appendChild(tongue);
  boardSvg.appendChild(group);
}

// رسم تمام نردبان‌ها از روی قوانین فعلی بازی
Object.entries(ladders).forEach(([from, to]) => {
  drawLadder(Number(from), to);
});

// رنگ‌های مختلف برای مارها
const snakeColors = [
  ["#22c55e", "#86efac"],
  ["#ef4444", "#fca5a5"],
  ["#a855f7", "#d8b4fe"],
];

// رسم تمام مارها از روی قوانین فعلی بازی
Object.entries(snakes).forEach(([from, to], index) => {
  const colors = snakeColors[index % snakeColors.length];

  drawSnake(Number(from), to, colors[0], colors[1]);
});

Object.keys(ladders).forEach(function (x) {
  $(".cell")
    .filter(function () {
      return $(this).attr("data-number") === x;
    })
    .append("<span class = 'ladder-icon'></span>");
});

Object.keys(snakes).forEach(function (x) {
  $(".cell")
    .filter(function () {
      return $(this).attr("data-number") === x;
    })
    .append("<span class = 'snake-icon'></span>");
});

const images = [
  "images/dice1.png",
  "images/dice2.png",
  "images/dice3.png",
  "images/dice4.png",
  "images/dice5.png",
  "images/dice6.png",
];

let positions = [1, 1];
let currentPlayer = 0;
let gameOver = false;

let players = [
  $("<div class='player'></div>"),
  $("<div class='player player-two'></div>"),
];
/////////////
function movetocell(index) {
  $(".cell")
    .filter(function () {
      return Number($(this).attr("data-number")) === positions[index];
    })
    .append(players[index]);
}

// Update both players' positions
function updatePositions() {
  $("#player-position").text(`Player 1: Position ${positions[0]}`);

  $("#player2-position").text(`Player 2: Position ${positions[1]}`);
}
movetocell(0);
movetocell(1);
updatePositions();
//////////
$("#roll-dice").on("click", function () {
  if (gameOver) return;
  let dice = Math.floor(Math.random() * images.length);
  $("#dice-result").html(`<img src="${images[dice]}" />`);
  dice++;
  let newPosition = dice + positions[currentPlayer];
  if (newPosition <= 100) {
    positions[currentPlayer] = newPosition;
  }
  if (ladders[positions[currentPlayer]] !== undefined) {
    positions[currentPlayer] = ladders[positions[currentPlayer]];
  } else if (snakes[positions[currentPlayer]] !== undefined) {
    positions[currentPlayer] = snakes[positions[currentPlayer]];
  }
  movetocell(currentPlayer);
  updatePositions();
  //
  if (positions[currentPlayer] === 100) {
    gameOver = true;

    $("#dice-result")
      .text(`🎉 Player ${currentPlayer + 1} Wins! 🏆`)
      .addClass("win");

    $("#current-turn").text("🎊 Game Over!");

    return;
  }

  /////////////
  currentPlayer = 1 - currentPlayer;

  const color = currentPlayer === 0 ? "🔴" : "🔵";

  $("#current-turn").text(`Turn: Player ${currentPlayer + 1} ${color}`);
});
/////////
$("#restart-game").on("click", function () {
  positions = [1, 1];
  currentPlayer = 0;
  gameOver = false;

  movetocell(0);
  movetocell(1);

  updatePositions();

  $("#current-turn").text("Turn: Player 1 🔴");

  $("#dice-result").text("🎲 Dice: -").removeClass("win");
});
