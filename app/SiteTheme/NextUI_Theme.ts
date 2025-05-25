import { nextui } from "@nextui-org/react";

module.exports = {
    plugins: [
      nextui({
        addCommonColors: true,
        themes: {
          light: {
            // ...
            colors: {
                success:'#92981B'
            },
          },
          dark: {
            // ...
            colors: {
                success:'#92981B'
            },
          },
          // ... custom themes
        },
      }),
    ],
  };