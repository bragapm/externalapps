export default defineAppConfig({
  ui: {
    primary: "brand",
    gray: "neutral",
    pagination: {
      inactiveButton: {
        color: {
          custom: "bg-red-500 dark:bg-red-500 text-blue-500 dark:text-blue-500",
        },
      },
    },
    button: {
      variant: {
        outline:
          "bg-transparent ring-1 ring-{color}-500 ring-inset text-{color}-500 hover:ring-{color}-700  disabled:text-neutral-600 disabled:ring-neutral-600 disabled:hover:bg-transparent hover:bg-{color}-950 focus-visible:ring-1 focus-visible:ring-brand-200",
        paginationActive:
          "bg-brand-950 border border-brand-950 text-brand-500 text-2xs rounded-xxs w-6 h-6 justify-center",
        paginationInactive:
          "bg-neutral-700 border-neutral-600 text-neutral-200 text-2xs rounded-xxs w-6 h-6 justify-center",
      },
      color: {
        navMenu: {
          solid:
            "shadow-sm text-white dark:text-neutral-900 bg-white/10 hover:bg-white/20 disabled:bg-white/10 dark:bg-white dark:hover:bg-neutral-100 dark:disabled:bg-white focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
        },
        navActive: {
          solid:
            "shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 text-[#DD5E28] dark:text-white bg-white hover:bg-white/90 disabled:bg-white dark:bg-neutral-900 dark:hover:bg-neutral-800/50 dark:disabled:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
        },
      },
    },
    input: {
      color: {
        gray: {
          outline:
            "shadow-sm bg-neutral-700 dark:bg-neutral-700 text-neutral-200 dark:text-white ring-1 ring-inset ring-neutral-600 dark:ring-neutral-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
        },
      },
    },
    notifications: {
      position: "bottom-0 top-auto",
    },
    notification: {
      background: "bg-neutral-900",
      rounded: "rounded-xs",
      title: "text-sm font-medium text-neutral-50",
      description: "text-sm font-normal text-gray-400",
      ring: "ring-1 ring-gray-800",
      padding: "p-4",
      icon: {
        color: "text-brand-500",
      },
    },
  },
});
