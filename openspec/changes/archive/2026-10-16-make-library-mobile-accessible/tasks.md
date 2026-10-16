## 1. Mobile Library

- [x] 1.1 Replace the small-screen desktop-only message with a responsive song list and search field using the existing filtered song data; include play links and natively disabled add, edit, and delete controls. Verify the mobile markup exposes only song browsing/play actions and the desktop presentation remains intact.
- [x] 1.2 Update `lib/__tests__/library-play-link.test.tsx` to assert mobile song play links and disabled management controls while confirming desktop song-management controls remain enabled; verify with `npm run test -- lib/__tests__/library-play-link.test.tsx`.

## 2. Validation

- [x] 2.1 Check the library below and above the existing `sm` breakpoint: confirm title/artist search and empty results on mobile, play navigation works, mobile management controls cannot be activated, and desktop song and artist management still works.
- [x] 2.2 Run `npm run typecheck` and `npm run lint` to verify the responsive implementation and test changes.
