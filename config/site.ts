/**
 * Product-level constants: names, artwork and units that are not user-facing
 * copy and do not change per environment.
 *
 * Static image files referenced here must exist under `public/`. The source
 * artwork lives in `front-assent-for-ai/`, which is never served.
 */
export const site = {
  name: "سامانه مدیریت اقساط موبایل معراجی",
  shortName: "موبایل معراجی",
  currency: "تومان",

  logo: {
    src: "/brand/logo.png",
    alt: "موبایل معراجی",
    width: 512,
    height: 220,
  },

  defaultAvatar: "/brand/avatar.png",
} as const;
