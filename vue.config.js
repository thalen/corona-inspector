module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        secure: false
      }
    }
  }
};
