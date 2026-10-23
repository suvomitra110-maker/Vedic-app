# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched is denied (`allow read, write: if false;`).
2. **Strict Tenant & PII Isolation**: Every collection (`/users/{userId}/charts/{chartId}`, `/users/{userId}/dailyPlans/{planId}`, `/users/{userId}/horizonPlans/{horizonId}`) is strictly scoped to the verified owner (`request.auth.uid == userId` and `request.auth.token.email_verified == true`).
3. **Path Variable Hardening**: All path IDs (`userId`, `chartId`, `planId`, `horizonId`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **Anti-Update-Gap & Strict Schema Blueprint**: Every `create` and `update` invokes `isValidUserChart`, `isValidDailyPlanItem`, or `isValidHorizonRoadmap`, enforcing `.keys().hasAll(...)` and `.keys().hasOnly(...)`, exact types, bounded string lengths, immutable `userId` and `createdAt`, and server-enforced `request.time` timestamps.
5. **Terminal State Locking**: Once a `HorizonRoadmap` reaches `status == 'archived'`, no further updates are permitted.
6. **Query Enforcer on `list`**: Every `allow list` rule verifies both path ownership (`request.auth.uid == userId`) and document ownership (`resource.data.userId == request.auth.uid`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return `PERMISSION_DENIED`)
1. **Unauthenticated Write**: `auth = null` attempting `create` on `/users/u1/charts/c1`.
2. **Unverified Email Spoof**: `auth.uid = 'u1'`, `email_verified = false` attempting `create` on `/users/u1/charts/c1`.
3. **Cross-Tenant Read/Write**: `auth.uid = 'attacker'` attempting `get` or `create` on `/users/victim/charts/c1`.
4. **Payload Owner Spoofing**: `auth.uid = 'u1'` writing `userId: 'u2'` inside `/users/u1/charts/c1`.
5. **Shadow / Ghost Field Injection**: Adding `isAdmin: true` to `/users/u1/dailyPlans/p1`.
6. **Path ID Poisoning**: Creating a document with a 300-character or special-character ID (`chart$bad!`).
7. **String Volumetric Exhaustion (Denial of Wallet)**: Writing a 5,000-character `summaryDictum` (exceeds `maxLength: 2000`).
8. **Invalid Enum Injection**: Writing `durationMonths: 99` on `HorizonRoadmap` (only `3, 6, 12` allowed) or `itemType: 'hack'` on `DailyPlanItem`.
9. **Client Timestamp Forgery**: Supplying a past or future `createdAt` or `updatedAt` != `request.time`.
10. **Immutable Field Mutation**: Attempting to mutate `createdAt` or `userId` during `update`.
11. **Terminal State Bypass**: Attempting to `update` a `HorizonRoadmap` whose existing `status` is already `'archived'`.
12. **Unauthorized List Scraping**: Attempting `list` on `/users/u1/dailyPlans` where `resource.data.userId != request.auth.uid`.
