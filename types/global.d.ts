declare global {
  interface Window {
    __translations: Record<string, any>;
  }
}

export {};