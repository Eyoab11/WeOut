const fs = require('node:fs');
const ts = require('typescript');
const test = require('node:test');
const assert = require('node:assert/strict');
const compiled = ts.transpileModule(fs.readFileSync(__dirname + '/../src/features/sidequests/model.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports);
const { blankProgress, applyPhotoPost, dailyQuest, streakFor, generateQuest, CATEGORIES, questSchema } = loaded.exports;
const day = '2026-09-09';
const photo = (id, questId) => ({ id, questId, caption: 'A lovely discovery', place: 'Nairobi', photoUri: 'file:///own-photo.jpg', createdAt: day + 'T12:00:00Z' });
test('daily challenge is identical for the same UTC date and changes tomorrow', () => {
 assert.deepEqual(dailyQuest(day), dailyQuest(day)); assert.notEqual(dailyQuest(day).id, dailyQuest('2026-09-10').id);
});
test('photo-backed quest and travel post count once per day; retries are idempotent', () => {
 const quest = dailyQuest(day); const p = { ...blankProgress(), started: [quest.id] };
 const completed = applyPhotoPost(p, photo('quest-photo',quest.id), quest);
 const combined = applyPhotoPost(completed, photo('travel-photo'));
 assert.deepEqual(combined.days,[day]); assert.equal(combined.completed[quest.id],'quest-photo');
 assert.equal(applyPhotoPost(completed,photo('quest-photo',quest.id),quest),completed);
 assert.throws(() => applyPhotoPost(completed,photo('another-photo',quest.id),quest),/already completed/);
});
test('missing photo, unjoined, unknown and expired quests cannot complete', () => {
 const quest=dailyQuest(day); const p=blankProgress();
 assert.throws(()=>applyPhotoPost(p,{...photo('no-photo'),photoUri:''}),/photo/);
 assert.throws(()=>applyPhotoPost(p,photo('unjoined',quest.id),quest),/Start/);
 assert.throws(()=>applyPhotoPost(p,photo('unknown','missing')),/available/);
 assert.throws(()=>applyPhotoPost(p,photo('mismatch'),quest),/available/);
 assert.throws(()=>applyPhotoPost({...p,started:[quest.id]},{...photo('expired',quest.id),createdAt:'2026-09-10T00:00:00Z'},quest),/ended/);
 assert.deepEqual(p,blankProgress());
});
test('streak spans year and leap boundaries, keeps yesterday, resets after missed day', () => {
 assert.equal(streakFor(['2025-12-31','2026-01-01'],'2026-01-02').current,2);
 assert.equal(streakFor(['2024-02-28','2024-02-29','2024-03-01'],'2024-03-01').current,3);
 assert.deepEqual(streakFor(['2026-09-06','2026-09-07','2026-09-07'],day),{current:0,longest:2,todayDone:false});
 assert.equal(streakFor([day,day,'2099-01-01','invalid'],day).current,1);
});
test('all generated categories produce valid editable quests',()=>{
 for(const category of CATEGORIES) for(let seed=0;seed<3;seed++) assert.equal(questSchema.safeParse(generateQuest(category,20,seed)).success,true);
 assert.equal(questSchema.safeParse({title:'x',description:'short',category:'unknown',minutes:0}).success,false);
});
