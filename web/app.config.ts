export default defineAppConfig({
  ui: {
    colors: {
      primary: "brand",
      secondary: "grey",
      gray: "grey",
      brand: "brand",
      error: "red",
    },
    navigationMenu: {
      compoundVariants: [
        {
          color: "primary",
          variant: "pill",
          active: true,
          class: {
            link: "text-primary bg-brand-50 rounded-xs",
            linkLeadingIcon:
              "text-primary group-data-[state=open]:text-primary",
          },
        },
      ],
    },
    badge: {
      variants: {
        // size: { sm: { base: "text-[8px]/3 px-1 py-0.5 gap-1 rounded-2xs" } },
      },
    },
    button: {
      compoundVariants: [
        {
          color: "neutral",
          variant: "outline",
          class: "ring-grey-500",
        },
      ],
    },
    formField: {
      slots: { root: "w-full", label: "text-xs", error: "mt-[2pxt] text-xs" },
    },
    input: {
      slots: {
        trailingIcon: "text-grey-500",
      },
      variants: { variant: { outline: "ring-grey-500" } },
    },
    selectMenu: {
      slots: {
        trailingIcon: "text-grey-500",
        item: ["data-highlighted:not-data-disabled:before:rounded-2xs"],
        content: ["rounded-2xs"],
      },
      variants: { variant: { outline: "ring-grey-500" } },
    },
    select: {
      slots: {
        trailingIcon: "text-grey-500",
        item: ["data-highlighted:not-data-disabled:before:rounded-2xs"],
        content: "rounded-2xs ring-grey-500",
      },
      variants: { variant: { outline: "ring-grey-500" } },
    },
    separator: {
      variants: { color: { neutral: { border: "border-grey-300" } } },
    },
    textarea: {
      slots: {},
      variants: { variant: { outline: "ring-grey-500" } },
    },
    // pagination: {
    //   inactiveButton: {
    //     color: {
    //       custom: "bg-red-500 dark:bg-red-500 text-blue-500 dark:text-blue-500",
    //     },
    //   },
    // },
    // button: {
    //   variant: {
    //     outline:
    //       "bg-{color}-950 ring-1 ring-{color}-500 ring-inset text-{color}-500 hover:ring-{color}-700  disabled:text-grey-600 disabled:ring-grey-600 disabled:hover:bg-transparent hover:bg-{color}-950 focus-visible:ring-1 focus-visible:ring-brand-200",
    //     paginationActive:
    //       "bg-brand-950 border border-brand-950 text-brand-500 text-2xs rounded-xxs w-6 h-6 justify-center",
    //     paginationInactive:
    //       "bg-grey-700 border-grey-600 text-grey-200 text-2xs rounded-xxs w-6 h-6 justify-center",
    //   },
    //   color: {
    //     navMenu: {
    //       solid:
    //         "shadow-sm text-white dark:text-grey-900 bg-white/10 hover:bg-white/20 disabled:bg-white/10 dark:bg-white dark:hover:bg-grey-100 dark:disabled:bg-white focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
    //     },
    //     navActive: {
    //       solid:
    //         "shadow-sm ring-1 ring-inset ring-grey-300 dark:ring-grey-700 text-brand-500 dark:text-white bg-white hover:bg-white/90 disabled:bg-white dark:bg-grey-900 dark:hover:bg-grey-800/50 dark:disabled:bg-grey-900 focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
    //     },
    //   },
    // },
    // input: {
    //   variants: {
    //     variant: {
    //       outline:
    //         "shadow-sm bg-grey-700 dark:bg-grey-700 text-grey-200 dark:text-white ring-1 ring-inset ring-grey-600 dark:ring-grey-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 placeholder:text-grey-200 rounded-xxs",
    //     },
    //   },
    // },
    // select: {
    //   color: {
    //     gray: {
    //       outline:
    //         "shadow-sm bg-grey-700 dark:bg-grey-700 text-grey-200 dark:text-white ring-1 ring-inset ring-grey-600 dark:ring-grey-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
    //     },
    //   },
    // },
    // notifications: {
    //   position: "bottom-0 top-auto",
    // },
    // notification: {
    //   background: "bg-grey-900",
    //   rounded: "rounded-xs",
    //   title: "text-sm font-medium text-grey-50",
    //   description: "text-sm font-normal text-grey-400",
    //   ring: "ring-1 ring-grey-800",
    //   padding: "p-4",
    //   icon: {
    //     color: "text-brand-500",
    //   },
    // },
  },
});
