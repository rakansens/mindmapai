declare module 'html-to-image' {
  export interface Options {
    quality?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
    style?: Record<string, string>;
    filter?: (node: HTMLElement) => boolean;
    skipFonts?: boolean;
    preferredFontFormat?: string;
    cacheBust?: boolean;
    imagePlaceholder?: string;
    pixelRatio?: number;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
} 