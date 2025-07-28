// Development logger utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

// Simple production-safe console replacements
export const devLog = isDevelopment ? console.log : () => {};
export const devError = isDevelopment ? console.error : () => {};
export const devWarn = isDevelopment ? console.warn : () => {};

export default logger; 