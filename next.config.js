const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  images: {
    domains: ['googleusercontent.com', 'lh3.googleusercontent.com']
  }
}

module.exports = nextConfig
