const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/huy-portfolio' : '';

module.exports = {
  basePath: basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  output: 'export',
  // Make basePath available to components
  env: {
    BASE_PATH: basePath
  }
};
