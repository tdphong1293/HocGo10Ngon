import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Turbopack configuration for SVG
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js'
			}
		}
	},
	// Fallback webpack config for when Turbopack is disabled
	webpack(config: any) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack']
		});
		return config;
	}
};

export default nextConfig;
