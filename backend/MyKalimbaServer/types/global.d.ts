// Placeholder for backend TypeScript migration.
// Keeping a .d.ts in the program avoids TS18003 (no inputs found) before we start converting .js -> .ts.

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
