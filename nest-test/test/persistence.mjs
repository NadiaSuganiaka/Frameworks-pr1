import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const port = 3101;
const base = `http://127.0.0.1:${port}`;
let server;
async function start() {
  server = spawn(process.execPath, ['--env-file=.env', 'dist/main.js'], {
    env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', (data) => { output += data; });
  server.stderr.on('data', (data) => { output += data; });
  for (let i = 0; i < 600; i++) {
    if (server.exitCode !== null) throw new Error(output);
    try { if ((await fetch(base)).ok) return; } catch {}
    await delay(100);
  }
  throw new Error(`Server did not start: ${output}`);
}
async function stop() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolve) => server.once('exit', resolve));
  server.kill();
  await exited;
}
async function api(method, path, body, status) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) options.body = JSON.stringify(body);
  const response = await fetch(`${base}${path}`, options);
  assert.equal(response.status, status, await response.clone().text());
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}
let id;
try {
  await start();
  const name = `Persistence-${Date.now()}`;
  const created = await api('POST', '/projects', { name, status: 'draft' }, 201);
  id = created.id;
  assert.deepEqual(Object.keys(created).sort(), ['createdAt', 'id', 'name', 'status']);
  await api('POST', '/projects', { name, status: 'active' }, 409);
  const concurrentName = `${name}-race`;
  const concurrent = await Promise.all([1, 2].map(() => fetch(`${base}/projects`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: concurrentName, status: 'active' }),
  })));
  assert.deepEqual(concurrent.map((r) => r.status).sort(), [201, 409]);
  const winner = await concurrent.find((r) => r.status === 201).json();
  await api('DELETE', `/projects/${winner.id}`, undefined, 200);
  await stop();
  await start();
  assert.deepEqual(await api('GET', `/projects/${id}`, undefined, 200), created);
  const updated = await api('PATCH', `/projects/${id}`, { description: 'Persisted', status: 'completed' }, 200);
  await stop();
  await start();
  assert.deepEqual(await api('GET', `/projects/${id}`, undefined, 200), updated);
  assert.ok((await api('GET', '/projects', undefined, 200)).some((p) => p.id === id));
  await api('DELETE', `/projects/${id}`, undefined, 200);
  await stop();
  await start();
  await api('GET', `/projects/${id}`, undefined, 404);
  await api('PATCH', `/projects/${id}`, { status: 'active' }, 404);
  await api('DELETE', `/projects/${id}`, undefined, 404);
  console.log('PASS: create/read/update/delete persist across three server restarts; HTTP shape, 409 and 404 preserved.');
} finally {
  if (id && server?.exitCode === null) {
    await fetch(`${base}/projects/${id}`, { method: 'DELETE' }).catch(() => {});
  }
  await stop();
}
