export default defineAppConfig({
  ui: {
    primary: "brand",
    gray: "grey",
    button: {
      color: {
        navMenu: {
          solid:
            "shadow-sm text-white dark:text-grey-900 bg-white/10 hover:bg-white/20 disabled:bg-white/10 dark:bg-white dark:hover:bg-grey-100 dark:disabled:bg-white focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
        },
        navActive: {
          solid:
            "shadow-sm ring-1 ring-inset ring-grey-300 dark:ring-grey-700 text-[#DD5E28] dark:text-white bg-white hover:bg-white/90 disabled:bg-white dark:bg-grey-900 dark:hover:bg-grey-800/50 dark:disabled:bg-grey-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
        },
      },
    },
  },
});
