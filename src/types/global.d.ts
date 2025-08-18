// Global type declarations for window object extensions

declare global {
  interface Window {
    openNewsletterModal: () => void;
    closeNewsletterModal: () => void;
  }
}

// This export is required to make this file a module
export {};
