/*const USERS_KEY = 'ab.users';
const SESSION_KEY = 'ab.session';

const seed = () => {
    const k = 'ab.users'
    if(!localStorage.getItem(k)) {
        const users = [
            {id:'1',email:'admin@example.com', name: 'Admin User', role: 'Admin', password: 'Admin123$'},
            {id:'2',email:'user@example.com', name: 'User One', role: 'User', password: 'User1234$'},
        ]
        localStorage
    }
}

seed()

export const Auth = {
    login: (email, password) => {
        const users = JSON.parse(localStorage.getItem('ab.users') || [])
        const u = users.find(x => x.email.tolocaleLowerCase() === email.toLocaleLowerCase() && x.password === password  )
        if(!u) throw new Error ('Invalid credentials')
        localStorage.setItem('ab.session', JSON.stringify({userID: u.id, email: u.email, name: u.name, role: u.role }))
        return {...u, password: undefined}
    },
    logout: () => localStorage.removeItem('ab.session'),
    me: () => JSON.parse(localStorage.getItem('ab.session') || null)
}
*/

// src/lib/auth.js

const USERS_KEY = 'ab.users';
const SESSION_KEY = 'ab.session';

function safeParse(raw, fallback) {
  try {
    if (raw === null || raw === undefined) return fallback;
    // treat empty/whitespace as invalid
    if (typeof raw === 'string' && raw.trim() === '') return fallback;
    const v = JSON.parse(raw);
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedUsers() {
  const seed = [
    { id:'1', email:'admin@example.com', name:'Admin', role:'Admin', password:'Admin123$' },
    { id:'2', email:'user@example.com',  name:'User One', role:'User',  password:'User123$' }
  ];
  write(USERS_KEY, seed);
  return seed;
}

function ensureUsers() {
  const existing = safeParse(localStorage.getItem(USERS_KEY), null);
  if (!Array.isArray(existing) || existing.length === 0) {
    return seedUsers();
  }
  // sanity-check shape
  if (!existing[0]?.email || !existing[0]?.password) {
    return seedUsers();
  }
  return existing;
}

// Ensure users exist at module load (and repair if corrupted)
let _users = ensureUsers();

export const Auth = {
  login: (email, password) => {
    // refresh from storage each call in case another tab changed it
    const users = ensureUsers();
    const u = users.find(x => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
    if (!u) throw new Error('Invalid credentials');
    write(SESSION_KEY, { userId: u.id, email: u.email, name: u.name, role: u.role });
    return { ...u, password: undefined };
  },

  logout: () => localStorage.removeItem(SESSION_KEY),

  me: () => safeParse(localStorage.getItem(SESSION_KEY), null),

  // helper for demos: reset everything
  resetDemo: () => {
    localStorage.removeItem(SESSION_KEY);
    seedUsers();
  }
};
