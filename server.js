const express = require('express');
const path = require('path');

const app = express();
const PORT = 3005;
const HOST = '127.0.0.1';
const GPIO_PIN = 17;
const RELAY_ON = 0;  // aktív LOW: 0 = relé zár
const RELAY_OFF = 1; // aktív LOW: 1 = relé nyit
const TRIGGER_DURATION_MS = 1000;

let gpio = null;
let triggerInProgress = false;

// GPIO inicializálás — csak valódi Raspberry Pi-n működik
function initGpio() {
  try {
    const { Gpio } = require('onoff');
    gpio = new Gpio(GPIO_PIN, 'out');
    gpio.writeSync(RELAY_OFF);
    console.log(`GPIO ${GPIO_PIN} inicializálva, relé nyitva.`);
  } catch (err) {
    console.warn('GPIO nem elérhető (nem Raspberry Pi?), szimulált módban fut.');
    console.warn(err.message);
  }
}

function cleanup() {
  if (gpio) {
    gpio.writeSync(RELAY_OFF);
    gpio.unexport();
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/trigger', (req, res) => {
  if (triggerInProgress) {
    return res.status(429).json({ error: 'Már folyamatban van egy bekapcsolás.' });
  }

  triggerInProgress = true;
  console.log('Relé aktiválva — bekapcsolás folyamatban...');

  if (gpio) {
    gpio.writeSync(RELAY_ON);
  } else {
    console.log('[SZIMULÁCIÓ] Relé ZÁR');
  }

  setTimeout(() => {
    if (gpio) {
      gpio.writeSync(RELAY_OFF);
    } else {
      console.log('[SZIMULÁCIÓ] Relé NYIT');
    }
    triggerInProgress = false;
    console.log('Relé visszaállt — kész.');
    res.json({ ok: true });
  }, TRIGGER_DURATION_MS);
});

initGpio();

app.listen(PORT, HOST, () => {
  console.log(`PC Power szerver fut: http://${HOST}:${PORT}`);
});
