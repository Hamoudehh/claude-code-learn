/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' בבנייה ל-GitHub Pages: הנתונים נשמרים בדפדפן במקום בשרת */
  readonly VITE_STATIC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
