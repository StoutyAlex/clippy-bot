const glob = require('glob')
const path = require('path')

module.exports = {
  target: 'node14',
  entry: Object.fromEntries(glob.sync('./src/lambdas/**.ts').map((item) => [`${path.basename(item, '.ts')}/handler`, item])),
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: false,
  }
}
