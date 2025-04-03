import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	css: ["~/assets/css/tailwind.css"],
	app: {
		head: {
			viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
	ssr: false,
});
