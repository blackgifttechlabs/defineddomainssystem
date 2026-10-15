# Security notes

## Done in Phase 1
- Removed the "Bypass (Quick Log)" button and hardcoded admin credentials from `components/LoginPage.tsx`.
- Added `firestore.rules` (role-based; see transitional flags below).
- Viewing a student's health record now writes a `VIEW_HEALTH_RECORD` entry to the `logs` collection (SystemLogs) via `addSystemLog`.

## Still unsafe
1. **Plaintext passwords in Firestore.** `users`, `students`, `parents`, `staff` docs store a `password` field (see `types.ts`, `updateProfile`, student/parent/staff creation in `store/useStore.ts`).
2. **Client-side password comparison.** `login` in `store/useStore.ts` falls back to querying Firestore by email and comparing `foundDoc.password === cleanPass`, accepting the default `000000`, then re-syncing Firebase Auth passwords (`syncAuthPassword`, which also tries `pppppp`/`password`). This requires unauthenticated reads of those collections.
3. **Rules are deliberately loose until the above is fixed.** `legacyPublicDirectory()` and `legacyOpenReadForSignedIn()` in `firestore.rules` are `true`, so passwords are still publicly readable and any signed-in user can read clinical logs/payments/orders. Also the client opens unfiltered listeners for all collections for every role.
4. Users can create their own `users/{uid}` doc (needed by the fallback login) so a self-created doc could claim a role; fixed by removing the fallback.
5. Default/seeded credentials (`utils/seeder.ts`) and a shared default password `000000` for new accounts.
6. Notices/payments/orders writes are open to any signed-in user.

## Migration plan
1. Make Firebase Auth the only login: create Auth accounts for all users (admin script using Admin SDK, with password reset emails or forced reset), remove the Firestore fallback in `login` and `syncAuthPassword`.
2. Stop writing `password` in all Firestore docs; delete the existing `password` fields with a one-off script. Admin "set password" should call a Cloud Function using the Admin SDK.
3. Scope `initializeData` listeners per role (parents/students: `where('studentId','==',...)`; staff: assigned classes). Student login lookups by name/ID should move to a Cloud Function.
4. Set `legacyPublicDirectory()` and `legacyOpenReadForSignedIn()` to `false` in `firestore.rules`; for public ID verification, expose only a minimal projection (name, class, photo) through a function or a separate `public_student_cards` collection.
5. Set role via custom claims instead of reading `users/{uid}` in rules; add rate limiting/App Check on public forms.
6. Rotate all existing passwords; the `admin@gmail.com` / `pppppp` credentials from the removed bypass button must be considered compromised.
