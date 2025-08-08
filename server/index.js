const express = require('express');
const path = require('path');
const fs = require('fs');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'db.json');

// Ensure server folder exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
}

const defaultData = {
  gutscheine: [
    {
      id: 1,
      name: 'CineStar 10er Gutschein',
      kaufpreis: 80.0,
      ablaufdatum: '2025-12-31',
      status: 'teilweise eingelöst',
      eingelöstAm: '',
      film: '',
      kino: '',
      bestellnummer: '1006729134',
      konditionen:
        'Bis zu 10 Kinogutscheine für 1 Person für 2D-Filme inkl. Sitzplatz & Filmzuschlag bei CineStar. Gültig ab 01.01.2025 bis 31.12.2025.',
      anzahlNutzungen: 6,
      maxNutzungen: 10,
      einlösungen: [
        { datum: '2024-12-08', film: 'Wicked', uhrzeit: '19:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-001' },
        { datum: '2025-02-16', film: 'Captain America: Brave New World', uhrzeit: '19:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-002' },
        { datum: '2025-03-14', film: 'Mickey 17', uhrzeit: '22:45', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-003' },
        { datum: '2025-04-30', film: 'Thunderbolts*', uhrzeit: '22:20', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-004' },
        { datum: '2025-06-22', film: '28 Years Later', uhrzeit: '20:00', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-005' },
        { datum: '2025-07-22', film: 'Superman', uhrzeit: '20:10', kino: 'CineStar', anzahlPersonen: 1, gutscheinId: 'CS-006' }
      ],
      mehrerePersonen: false
    },
    {
      id: 2,
      name: '10 Tickets für 63€ (Kino-Gutschein)',
      kaufpreis: 63.0,
      ablaufdatum: '2026-03-15',
      status: 'gültig',
      eingelöstAm: '',
      film: '',
      kino: '',
      bestellnummer: '',
      konditionen:
        'Gültig für alle 2D-Filme inkl. Zuschläge. 3D-Zuschlag: +3€ (ggf. +1€ für 3D-Brille). Keine Einlösung bei Sonderveranstaltungen, Vorpremieren oder IMAX. Nicht einlösbar im Filmpalast am ZKM (Karlsruhe).',
      anzahlNutzungen: 0,
      maxNutzungen: 10,
      einlösungen: [],
      mehrerePersonen: false
    }
  ]
};

const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, defaultData);

async function initDb() {
  await db.read();
  if (!db.data || !Array.isArray(db.data.gutscheine)) {
    db.data = defaultData;
    await db.write();
  }
}

const app = express();
app.use(express.json({ limit: '1mb' }));

// Simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// List all vouchers
app.get('/api/gutscheine', async (_req, res) => {
  await db.read();
  res.json(db.data.gutscheine);
});

// Create
app.post('/api/gutscheine', async (req, res) => {
  const gutschein = req.body;
  await db.read();
  const nextId = gutschein.id || Date.now();
  const newItem = { ...gutschein, id: nextId };
  db.data.gutscheine.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

// Update
app.put('/api/gutscheine/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updated = req.body;
  await db.read();
  const idx = db.data.gutscheine.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.gutscheine[idx] = { ...updated, id };
  await db.write();
  res.json(db.data.gutscheine[idx]);
});

// Delete
app.delete('/api/gutscheine/:id', async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  const before = db.data.gutscheine.length;
  db.data.gutscheine = db.data.gutscheine.filter((g) => Number(g.id) !== id);
  if (db.data.gutscheine.length === before) return res.status(404).json({ error: 'Not found' });
  await db.write();
  res.status(204).end();
});

// Bulk import/replace
app.post('/api/import', async (req, res) => {
  const { gutscheine } = req.body || {};
  if (!Array.isArray(gutscheine)) return res.status(400).json({ error: 'Invalid payload' });
  await db.read();
  db.data.gutscheine = gutscheine.map((g) => ({ ...g, id: Number(g.id) || Date.now() }));
  await db.write();
  res.json({ ok: true, count: db.data.gutscheine.length });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
});


