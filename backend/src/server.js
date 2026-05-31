import cors from 'cors';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const port = Number(process.env.PORT ?? 4000);
const lessonsDir = process.env.LESSONS_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../lessons');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://sql_dojo_reader:sql_dojo_reader@localhost:5432/sql_dojo',
  statement_timeout: 5000,
  query_timeout: 5000
});

const allowedLessonLevels = new Set(['easy', 'intermediate', 'hard', 'bring-it-together']);
const blockedSqlPattern = /\b(drop|delete|update|insert|alter|truncate|create|grant|revoke|copy|call|do|execute|merge|vacuum|analyze)\b/i;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/lessons/:level', async (req, res, next) => {
  try {
    const { level } = req.params;
    if (!allowedLessonLevels.has(level)) {
      return res.status(404).json({ error: 'Unknown lesson level.' });
    }

    const filePath = path.join(lessonsDir, `${level}.json`);
    const json = await fs.readFile(filePath, 'utf8');
    res.type('application/json').send(json);
  } catch (error) {
    next(error);
  }
});

app.post('/query', async (req, res, next) => {
  const query = typeof req.body?.query === 'string' ? req.body.query : '';
  const validation = validateSql(query);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN READ ONLY');
    await client.query('SET LOCAL statement_timeout = 5000');

    const result = await client.query(validation.sql);

    await client.query('COMMIT');

    res.json({
      fields: result.fields.map((field) => field.name),
      rows: result.rows,
      rowCount: result.rowCount
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    next(error);
  } finally {
    client.release();
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message ?? 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`sql-dojo backend listening on ${port}`);
});

function validateSql(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: 'Enter a SQL query.' };
  }

  if (trimmed.length > 10000) {
    return { ok: false, error: 'Query is too long.' };
  }

  const withoutTrailingSemicolon = trimmed.replace(/;\s*$/, '');
  const scrubbed = scrubSql(withoutTrailingSemicolon);

  if (scrubbed.includes(';')) {
    return { ok: false, error: 'Only one SQL statement is allowed.' };
  }

  if (!/^\s*(select|with)\b/i.test(scrubbed)) {
    return { ok: false, error: 'Only SELECT and WITH queries are allowed.' };
  }

  if (blockedSqlPattern.test(scrubbed)) {
    return { ok: false, error: 'This query uses a blocked SQL keyword.' };
  }

  return { ok: true, sql: withoutTrailingSemicolon };
}

function scrubSql(sql) {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'([^']|'')*'/g, "''")
    .replace(/"([^"]|"")*"/g, '""')
    .toLowerCase();
}
