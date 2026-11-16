/** Admin panel URLs (Albanian, like the public site). */
export const ADMIN_PATHS = {
  home: "/admin",
  login: "/admin/hyr",
  leads: "/admin/kerkesat",
  models: "/admin/modelet",
  accessories: "/admin/aksesoret",
  brands: "/admin/brendet",
  posts: "/admin/postimet",
  banner: "/admin/banneri",
  subscribers: "/admin/abonentet",
  history: "/admin/historiku",
} as const;

/** Path segment for "create new" pages, e.g. /admin/modelet/i-ri. */
export const NEW_SEGMENT = "i-ri";
