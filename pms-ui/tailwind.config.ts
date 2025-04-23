import {heroui} from '@heroui/theme';
import type { Config } from "tailwindcss";

const {heroui} = require("@heroui/react");



export default {
    darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
        

  ],
  theme: {
  	extend: {
  		colors: {
  			primary: '#00d154',
  			secondary: '#388e3c',
  			
  		}
  	}
  },
  plugins: [heroui()],
} satisfies Config;
