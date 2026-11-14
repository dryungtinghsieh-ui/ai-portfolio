/**
 * Keep newest complete turns within the Worker's character and UTF-8 byte budgets.
 * @param {{role: 'user' | 'assistant', content: string}[]} messages
 * @param {string} next
 */
export function contextFor(messages, next) {
  let history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
  while (history.length && (
    history.reduce((sum, m) => sum + m.content.length, next.length) > 20000 ||
    new TextEncoder().encode(JSON.stringify({ message: next, history })).byteLength > 32000
  )) history = history.slice(2);
  return history;
}
