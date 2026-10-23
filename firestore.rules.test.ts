import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Firestore Security Rules satisfy all Dirty Dozen zero-trust invariants', () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  // 1. Default-Deny Catch-All
  assert.ok(rules.includes('match /{document=**}'));
  assert.ok(rules.includes('allow read, write: if false;'));

  // 2. Verified Email + Auth Ownership
  assert.ok(rules.includes('request.auth != null && request.auth.token.email_verified == true'));
  assert.ok(rules.includes('request.auth.uid == userId'));

  // 3. Path Variable Hardening
  assert.ok(rules.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));

  // 4. Strict Schema Blueprints & Anti-Update-Gap on all 3 collections
  assert.ok(rules.includes('isValidUserChart(incoming(), userId)'));
  assert.ok(rules.includes('isValidDailyPlanItem(incoming(), userId)'));
  assert.ok(rules.includes('isValidHorizonRoadmap(incoming(), userId)'));

  // 5. Server Timestamp Enforcement & Immutability
  assert.ok(rules.includes('incoming().createdAt == request.time'));
  assert.ok(rules.includes('incoming().updatedAt == request.time'));
  assert.ok(rules.includes('incoming().createdAt == existing().createdAt'));
  assert.ok(rules.includes('incoming().userId == existing().userId'));

  // 6. Terminal State Locking on HorizonRoadmap
  assert.ok(rules.includes("existing().status != 'archived'"));

  // 7. Query Enforcer on list
  assert.ok(rules.includes('allow list: if isOwner(userId) && existing().userId == request.auth.uid;'));
});
