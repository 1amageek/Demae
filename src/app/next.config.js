const path = require('path')
const Dotenv = require('dotenv-webpack')
const withWorkers = require('@zeit/next-workers')

const baseConfig = (nextConfig = {
	distDir: "../../dist/functions/next"
}) => {
	return Object.assign({}, nextConfig, {
		distDir: "../../dist/functions/next",
		webpack(config, options) {
			const { dir, dev } = options

			const devProject = process.env.FIREBASE_PROJECT !== "production"
			const envfile = dev ? '.development.env' : devProject ? '.development.env' : '.production.env'
			config.plugins = config.plugins || []
			config.plugins = [
				...config.plugins,

				// Read the .env file
				new Dotenv({
					path: path.join(__dirname, envfile),
					systemvars: true
				})
			]

			config.resolve.alias = {
				...config.resolve.alias,
				'common': path.resolve(__dirname, '../functions/common'),
				'components': path.resolve(__dirname, 'components'),
				'context': path.resolve(__dirname, 'context'),
				'hooks': path.resolve(__dirname, 'hooks'),
				'models': path.resolve(__dirname, 'models'),
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

			if (typeof nextConfig.webpack === 'function') {
				return nextConfig.webpack(config, options)
			}

			return config
		}
	})
}


module.exports = withWorkers(baseConfig({}))

// module.exports = withWorkers({
// 	webpack(config, options) {
// 		const { dir, dev } = options

// 		config.distDir = "../../dist/functions/next"

// 		const devProject = process.env.FIREBASE_PROJECT !== "production"
// 		const envfile = dev ? '.development.env' : devProject ? '.development.env' : '.production.env'
// 		config.plugins = config.plugins || []
// 		config.plugins = [
// 			...config.plugins,

// 			// Read the .env file
// 			new Dotenv({
// 				path: path.join(__dirname, envfile),
// 				systemvars: true
// 			})
// 		]

// 		config.resolve.alias = {
// 			...config.resolve.alias,
// 			'common': path.resolve(__dirname, '../functions/common'),
// 			'components': path.resolve(__dirname, 'components'),
// 			'context': path.resolve(__dirname, 'context'),
// 			'hooks': path.resolve(__dirname, 'hooks'),
// 			'models': path.resolve(__dirname, 'models'),
// 			'public': path.resolve(__dirname, 'public')
// 		}

// 		config.module.rules.push(
// 			{
// 				oneOf: [
// 					{
// 						test: /\.(js|mjs|jsx|ts|tsx)$/,
// 						include: dir,
// 						exclude: /node_modules/,
// 						use: [{
// 							loader: "ts-loader"
// 						}]
// 					},
// 					{
// 						loader: require.resolve("file-loader"),
// 						include: dir,
// 						exclude: [/\.(js|mjs|jsx|ts|tsx|styl|css)$/, /\.html$/, /\.json$/],
// 						options: {
// 							publicPath: "/_next",
// 							name: "static/media/[name].[hash:8].[ext]",
// 						},
// 					}
// 				]
// 			}
// 		)

// 		if (typeof nextConfig.webpack === 'function') {
// 			return nextConfig.webpack(config, options)
// 		}

// 		return config
// 	}
// })



