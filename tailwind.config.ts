import type { Config } from "tailwindcss";
import flowbiteReact from "flowbite-react/plugin/tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ".flowbite-react\\class-list.json"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      textColor:{
        appGreen:"#92981B",
        appGray:'#837676',
      },
      backgroundColor:{
        appGreen:"#92981B",
        appGray:'#837676',
      },
      ringColor:{
        appGreen:"#92981B",
        appGray:'#837676',
      },
      borderColor:{
        appGreen:"#92981B",
        appGray:'#837676',
      },fontFamily:{
        poppinsRegular:['var(--font-poppinsRegular-400)'],
        poppinsBold: ['var(--font-poppins-bold)'],
        poppinsLight:['var(--font-poppins-light)']
      }
    },
  },
  plugins: [flowbiteReact],
};
export default config;