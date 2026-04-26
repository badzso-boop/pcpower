const express = require('express');
const path = require('path');
const { execFile } = require('child_process');

const app = express();
const PORT = 3005;
const HOST = '127.0.0.1';
const TRIGGER_SCRIPT = path.join(__dirname, 'trigger.py');

let triggerInProgress = false;

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/trigger', (req, res) => {
  if (triggerInProgress) {
    return res.status(429).json({ error: 'Már folyamatban van egy bekapcsolás.' });
  }

  triggerInProgress = true;
  console.log('Relé aktiválva — bekapcsolás folyamatban...');

  execFile('python3', [TRIGGER_SCRIPT], (err) => {
    triggerInProgress = false;
    if (err) {
      console.error('GPIO hiba:', err.message);
      return res.status(500).json({ error: 'GPIO hiba: ' + err.message });
    }
    console.log('Relé visszaállt — kész.');
    res.json({ ok: true });
  });
});

app.listen(PORT, HOST, () => {
  console.log(`PC Power szerver fut: http://${HOST}:${PORT}`);
});
