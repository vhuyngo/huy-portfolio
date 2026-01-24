const isProd = process.env.NODE_ENV === 'production';
module.exports = {
  assetPrefix: isProd ? '/huy-portfolio/' : '',
  images: { unoptimized: true },
  output: 'export'
};
