import localFont from "next/font/local";

/**
 * IRAN Sans (FaNum) — the single face used across the whole UI.
 *
 * The FaNum build draws Persian digits in the same face as Latin ones, so no
 * digit-to-glyph fallback ever happens mid-number.
 *
 * Each file is a separate static weight, and they are registered 1:1 against
 * `font-weight`. That matters: without it the browser would synthesise bold by
 * smearing the regular file, which looks visibly wrong in Persian.
 */
export const iranSans = localFont({
  src: [
    { path: "./fonts/iransans-fanum-ultralight.woff2", weight: "200", style: "normal" },
    { path: "./fonts/iransans-fanum-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/iransans-fanum-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/iransans-fanum-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/iransans-fanum-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/iransans-fanum-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-iran-sans",
  display: "swap",
});
