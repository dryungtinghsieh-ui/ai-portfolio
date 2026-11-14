import test from 'node:test';
import assert from 'node:assert/strict';
import { contextFor } from '../lib/agent-context.mjs';

const conversation = (turns, content) => Array.from({ length: turns * 2 }, (_, i) => ({
  role: i % 2 ? 'assistant' : 'user', content: content + i, tools: [{ result: 'never resend traces' }],
}));

test('keeps the newest five complete pairs and removes tool traces', () => {
  const messages = conversation(8, 'hello');
  const history = contextFor(messages, 'next');
  assert.equal(history.length, 10);
  assert.deepEqual(history[0], { role: 'user', content: 'hello6' });
  assert.ok(history.every((m, i) => m.role === (i % 2 ? 'assistant' : 'user') && !('tools' in m)));
  assert.equal(messages.length, 16);
});

test('long Chinese conversations fit the actual UTF-8 request body limit', () => {
  const message = '請'.repeat(4000);
  const history = contextFor(conversation(5, '研'.repeat(3500)), message);
  const bytes = new TextEncoder().encode(JSON.stringify({ message, history })).byteLength;
  assert.ok(bytes <= 32000);
  assert.equal(history.length % 2, 0);
  assert.ok(history.length < 10);
});

test('character limit and JSON escaping are counted before sending', () => {
  for (const text of ['a'.repeat(11000), '"\\\n'.repeat(3000), '🧪'.repeat(2500)]) {
    const history = contextFor(conversation(5, text), 'next');
    assert.ok(history.reduce((n, m) => n + m.content.length, 4) <= 20000);
    assert.ok(new TextEncoder().encode(JSON.stringify({ message: 'next', history })).byteLength <= 32000);
    assert.equal(history.length % 2, 0);
  }
});
