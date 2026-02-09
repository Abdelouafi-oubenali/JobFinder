# JobFinder — Users Feature Documentation

This document describes the `users` feature of the JobFinder Angular app: structure, components, service, mock backend, how to run and test, and recommended improvements.

---

## Project structure (users)

- `src/app/users/module` — user-facing routes and components
	- `users.module.ts` — routes: `/users/login`, `/users/register`, `/users/profile` (protected)
	- `login.component.ts` — login form and flow
	- `register.component.ts` — registration form
	- `profile.component.ts` — edit profile / delete account

- `src/app/users/service/users.service.ts` — HTTP client to the mock API (`http://localhost:3000/users`), exports `AppUser` interface and methods: `getAll`, `getByEmail`, `create`, `update`, `delete`, `login`.

- `src/app/users/store` — NgRx state for users
	- `users.actions.ts`, `users.reducer.ts`, `users.effects.ts`, `users.selectors.ts`, `users.state.ts`

---

## Key behavior & flows

- Login:
	- `LoginComponent` collects `email` and `password` and calls `AuthService.login(email, password)`.
	- `AuthService` uses `UsersService.login` to query the mock API and stores a safe user object (without password) in `sessionStorage` on success.
	- Components support a `returnUrl` query param to redirect after successful login.

- Register:
	- `RegisterComponent` collects `firstName`, `lastName`, `email`, `password` and calls `AuthService.register(user)`.
	- On success it navigates to `/users/login`.

- Profile:
	- `ProfileComponent` reads the current user via `AuthService.currentUser()`, patches the form, and allows update or deletion.
	- On update it calls `UsersService.update(user)` and refreshes `sessionStorage` with the safe user object.

- Users list & store:
	- `UserComponent` dispatches `loadUsers` and selects `selectAllUsers` from the store.
	- Effects call `UsersService.getAll()` to fetch users and dispatch success/failure actions.

---

## Mock backend (`db.json`)

The project contains `db.json` used with `json-server` for local development. Example structure:

```json
{
	"users": [
		{ "id": 1, "firstName": "Eos", "lastName": "Aperiam", "email": "puwyzyxem@mailinator.com", "password": "Pa$$w0rd!" }
	]
}
```

Start the mock API:

```bash
npx json-server --watch db.json --port 3000
```

Available endpoints (json-server):
- `GET /users`
- `GET /users?id=...`
- `GET /users?email=...&password=...` (used for login in this demo)
- `POST /users`, `PUT /users/:id`, `DELETE /users/:id`

> Note: passwords in `db.json` are plain text for the demo only — never do this in production.

---

## How to run the app locally

1. Start the mock api:

```bash
npx json-server --watch db.json --port 3000
```

2. Start the Angular dev server:

```bash
npm start
# follow the local URL printed by the CLI (e.g., http://localhost:4200 or another port)
```

3. Visit the app in the browser, go to `/users/login` to sign in with credentials from `db.json`.

---

## API surface (UsersService)

`AppUser` (interface):
- `id?: number`
- `firstName?: string`
- `lastName?: string`
- `email: string` (required)
- `password?: string`

Important methods:
- `getAll(): Observable<AppUser[]>` — GET `/users`
- `getByEmail(email: string): Observable<AppUser[]>` — GET `/users?email=...`
- `create(user: AppUser): Observable<AppUser>` — POST `/users`
- `update(user: AppUser): Observable<AppUser>` — PUT `/users/:id` (throws if no `id`)
- `delete(id: number)` — DELETE `/users/:id`
- `login(email: string, password: string): Observable<AppUser | null>` — GET `/users?email=...&password=...` then returns first match or `null`.

---

## Security considerations

- Do not store passwords in plaintext — use server-side hashing (bcrypt) and never expose raw passwords via API responses.
- Avoid storing sensitive data in `sessionStorage`/`localStorage` for production; prefer secure, `HttpOnly` session cookies.

---

## Testing and improvements (recommended next steps)

- Add form validators (`Validators.required`, `Validators.email`, `Validators.minLength`) to `RegisterComponent` and `LoginComponent`.
- Add unit tests for `UsersService` (mock `HttpClient`), `AuthService`, and user components.
- Harden authentication: replace demo `login` query with a real auth endpoint issuing JWT or session cookie.
- Improve UX: add loading states, success/failure notifications, and confirm dialog for account deletion.

---

If you'd like, I can also create `docs/USERS.md` with extended examples and sample curl calls.

