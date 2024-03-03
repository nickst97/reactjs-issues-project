require("dotenv").config();

const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	env: {
		GITHUB_TOKEN: process.env.GITHUB_TOKEN,
	},
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
};

module.exports = {
	async rewrites() {
		return [
			{ source: "/", destination: "/" },
			{ source: "/?state=OPEN", destination: "/" },
			{ source: "/?state=CLOSED", destination: "/" },
		];
	},
};

module.exports = nextConfig;
