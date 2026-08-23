import localFont from "next/font/local";

export const neueHaas = localFont({
  variable: "--font-neue-haas",
  src: [
    {
      path: "./fonts/NeueHaasGrotDisp-55Roman-Trial.otf",
      weight: "400",
    },
    {
      path: "./fonts/NeueHaasGrotDisp-65Medium-Trial.otf",
      weight: "500",
    },
    {
      path: "./fonts/NeueHaasGrotDisp-75Bold-Trial.otf",
      weight: "700",
    },
    {
      path: "./fonts/NeueHaasGrotDisp-95Black-Trial.otf",
      weight: "900",
    },
  ],
  display: "swap",
});
