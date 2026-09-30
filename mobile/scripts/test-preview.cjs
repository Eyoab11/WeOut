const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadSource(relative) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', relative), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(require, module, module.exports);
  return module.exports;
}
const { authenticateAccount } = loadSource('features/auth/accountFlow.ts');
const { signInSchema, signUpSchema } = loadSource('features/auth/validation.ts');
const { useTravelStore } = loadSource('stores/useTravelStore.ts');
const values = { email: 'traveler@example.com', password: 'example-password', fullName: 'Test Traveler', username: 'test_traveler' };
const sessionData = { user: { user_metadata: { display_name: 'Returning Traveler', username: 'returning' } }, session: { access_token: 'test-only' } };

test('preview signup returns a Home-ready identity without creating an account', async () => {
  const result = await authenticateAccount(null, true, values);
  assert.deepEqual(result, { kind: 'ready', name: 'Test Traveler', username: 'test_traveler', preview: true });
});
test('confirmed sign-in uses the backend identity and becomes Home-ready', async () => {
  let calls = 0;
  const client = { auth: { signInWithPassword: async input => { calls++; assert.equal(input.email, values.email); return { data: sessionData, error: null }; } } };
  const result = await authenticateAccount(client, false, values);
  assert.equal(calls, 1);
  assert.deepEqual(result, { kind: 'ready', name: 'Returning Traveler', username: 'returning', preview: false });
});
test('signup requiring confirmation does not become Home-ready', async () => {
  const client = { auth: { signUp: async () => ({ data: { session: null, user: {} }, error: null }) } };
  assert.deepEqual(await authenticateAccount(client, true, values), { kind: 'confirmation' });
});
test('signup with a real session becomes Home-ready', async () => {
  const client = { auth: { signUp: async () => ({ data: sessionData, error: null }) } };
  assert.equal((await authenticateAccount(client, true, values)).kind, 'ready');
});
test('backend errors propagate instead of creating a preview session', async () => {
  const client = { auth: { signInWithPassword: async () => ({ data: {}, error: new Error('Invalid credentials') }) } };
  await assert.rejects(authenticateAccount(client, false, values), /Invalid credentials/);
});
test('sign-in permits an existing short password; signup requires stronger input and consent', () => {
  assert.equal(signInSchema.safeParse({ email: values.email, password: 'short' }).success, true);
  assert.equal(signInSchema.safeParse({ email: 'bad', password: '' }).success, false);
  assert.equal(signUpSchema.safeParse({ ...values, agreed: true }).success, true);
  assert.equal(signUpSchema.safeParse({ ...values, agreed: false }).success, false);
  assert.equal(signUpSchema.safeParse({ ...values, agreed: true, password: 'short' }).success, false);
});
test('saved places, quest starts, connections and draft plans remain coherent across screens', () => {
  useTravelStore.getState().reset();
  useTravelStore.getState().toggleSave('beach');
  assert.deepEqual(useTravelStore.getState().saved, ['beach']);
  useTravelStore.getState().toggleSave('beach');
  assert.deepEqual(useTravelStore.getState().saved, []);
  useTravelStore.getState().startQuest('sunrise');
  useTravelStore.getState().startQuest('sunrise');
  useTravelStore.getState().connect('emma');
  useTravelStore.getState().connect('emma');
  assert.deepEqual(useTravelStore.getState().activeQuests, ['sunrise']);
  assert.deepEqual(useTravelStore.getState().connections, ['emma']);
  useTravelStore.getState().addTrip({ title: 'A little getaway', destination: 'Barcelona', dates: '2027-05-10 ? 2027-05-14' });
  useTravelStore.getState().addTrip({ title: 'Another getaway', destination: 'Tokyo', dates: '2027-06-10 ? 2027-06-14' });
  assert.equal(useTravelStore.getState().trips.length, 2);
  assert.notEqual(useTravelStore.getState().trips[0].id, useTravelStore.getState().trips[1].id);
  useTravelStore.getState().enter('New Traveler', 'new_traveler', true);
  assert.equal(useTravelStore.getState().trips.length, 0);
  assert.equal(useTravelStore.getState().connections.length, 0);
  assert.equal(useTravelStore.getState().profile.name, 'New Traveler');
});
