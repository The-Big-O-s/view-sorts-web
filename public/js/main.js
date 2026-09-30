
const btnPlay = document.getElementById('btn-play');
const playLabel = document.getElementById('play-label');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');
const inputSpeed = document.getElementById('input-speed');
const speedLabel = document.getElementById('speed-label');


const DEFAULT_SPEED = 10;//pasos por segundo

let stepMs = 1000 / DEFAULT_SPEED;
let playing = false;
let timer = null;


const handlers = {
  onStep: () => false,
  onReset: () => {},
};

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!handlers.onStep()) pause(); // terminó el ordenamiento
  }, stepMs);
}

function pause() {
  playing = false;
  clearInterval(timer);
  timer = null;
  playLabel.textContent = 'Play';
}

function play() {
  playing = true;
  playLabel.textContent = 'Pausa';
  startTimer();
}

// Velocidad: el valor del slider son pasos por segundo (mínimo 1)
function updateSpeed() {
  const pps = Math.max(1, Number(inputSpeed.value));
  speedLabel.textContent = pps;
  stepMs = 1000 / pps;
  if (playing) startTimer(); // aplica el cambio sin detener la animación
}

inputSpeed.addEventListener('input', updateSpeed);

btnPlay.addEventListener('click', () => (playing ? pause() : play()));

btnStep.addEventListener('click', () => {
  pause();
  handlers.onStep();
});

btnReset.addEventListener('click', () => {
  pause();
  handlers.onReset();
});


inputSpeed.value = DEFAULT_SPEED;
updateSpeed();
pause(); // Starts in Play

window.controls = handlers;