const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = (nextConfig = {
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
