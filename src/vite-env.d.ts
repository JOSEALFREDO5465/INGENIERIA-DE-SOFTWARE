/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}

declare module 'exceljs/dist/exceljs.min.js' {
  const ExcelJS: any;
  export default ExcelJS;
}
