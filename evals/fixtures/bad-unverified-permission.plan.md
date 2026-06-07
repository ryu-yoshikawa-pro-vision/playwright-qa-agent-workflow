<!-- Expected Semantic Review Decision: BLOCKED -->

# Delete User Permission Plan

## Feature summary

Only administrators can delete users. Standard users cannot delete users.

## Scope

User deletion permission checks.

## Account and role assumptions

- Admin account exists.
- Standard user account exists.

## Evidence references

| Evidence ID | Type     | What it proves                                                    |
| ----------- | -------- | ----------------------------------------------------------------- |
| EV-001      | snapshot | User list contains a Delete button when explored with one account |

## Scenarios

### TC-001 Admin can delete a user

Starting state: signed in as admin.

Steps:

1. Open `/users`.
2. Click Delete for a test user.
3. Confirm deletion.

Expected results:

- The user is removed from the list.

### TC-002 Standard user cannot delete a user

Starting state: signed in as standard user.

Steps:

1. Open `/users`.
2. Look for delete controls.

Expected results:

- Delete controls are not visible to the standard user.

## Unverified assumptions

- The evidence does not confirm which role was used.
- The standard user account has not been explored.
