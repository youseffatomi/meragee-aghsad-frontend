import type { Role } from "./permissions";

/**
 * User-facing copy that is shared across more than one component. Strings that
 * belong to a single feature live next to that feature instead, so this file
 * does not turn into an unsearchable dumping ground.
 *
 * Anything that needs a number interpolated is built at the call site from
 * `config/validation.ts`, so a limit is never typed twice.
 */
export const messages = {
  app: {
    title: "سامانه مدیریت اقساط معراجی",
    description: "مدیریت مشتریان، فاکتورها و اقساط",
  },

  roles: {
    SUPER_ADMIN: "مدیر ارشد",
    SELLER: "فروشنده",
    ACCOUNTANT: "حسابدار",
    USER: "کاربر",
  } satisfies Record<Role, string>,

  /** Copy that belongs to the panel's header chrome. */
  header: {
    greeting: "سلام، خوش آمدید",
    addInvoiceCta: "افزودن کردن فاکتور جدید",
    /** The compact label the floating button wears on narrow screens. */
    addInvoiceShort: "فاکتور",
  },

  actions: {
    logout: "خروج",
    retry: "تلاش دوباره",
    back: "بازگشت",
  },

  errors: {
    /** Raised when the request never reached the backend at all. */
    network: "ارتباط با سرور برقرار نشد. اتصال خود را بررسی کنید.",
    /** Anything the backend returned that we have no specific copy for. */
    unexpected: "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید.",
    unauthorized: "نشست شما منقضی شده است. دوباره وارد شوید.",
    forbidden: "شما به این بخش دسترسی ندارید.",
    notFound: "موردی یافت نشد.",
    validation: "اطلاعات واردشده معتبر نیست.",
  },
} as const;
