const path = require('path')
const withWorkers = require('@zeit/next-workers')
require('dotenv').config({ path: `.${process.env.NODE_ENV}.env` })

module.exports = withWorkers({
	distDir: '../../dist/functions/next',
	env: {
		USE_EMULATOR: process.env.USE_EMULATOR,
		HOST: process.env.HOST,
		FIREBASE_PROJECT: process.env.FIREBASE_PROJECT,
		STRIPE_API_KEY: process.env.STRIPE_API_KEY
	},
	webpack(config, options) {
		const { dir, dev } = options
		config.plugins = config.plugins || []
		config.plugins = [
			...config.plugins,
		]
		config.resolve.alias = {
			...config.resolve.alias,
			'common': path.resolve(__dirname, 'common'),
			'components': path.resolve(__dirname, 'components'),
			'hooks/commerce': path.resolve(__dirname, 'hooks/commerce'),
			'hooks': path.resolve(__dirname, 'hooks'),
			'models': path.resolve(__dirname, 'models'),
			'config': path.resolve(__dirname, 'config'),
			'utils': path.resolve(__dirname, 'utils'),
			'public': path.resolve(__dirname, 'public')
		}

		config.module.rules.push(
			{
				oneOf: [
					{
						test: /\.(js|mjs|jsx|ts|tsx)$/,
						include: dir,
						exclude: /node_modules/,
						use: [{
							loader: "ts-loader"
						}]
					},
					{
						loader: require.resolve("file-loader"),
						include: dir,
						exclude: [/\.(js|mjs|jsx|ts|tsx|styl|css)$/, /\.html$/, /\.json$/],
						options: {
							publicPath: "/_next",
							name: "static/media/[name].[hash:8].[ext]",
						},
					}
				]
			}
		)
		return config
	}
})
