import { Html, Head, Main, NextScript } from 'next/document'

export default function Document(){
  return (
    <Html lang="en">
      <Head>
        {/* SEO meta tags */}
        <meta charSet="UTF-8" />
        <meta name="keywords" content="web development, portfolio, skills, software engineering, backend, frontend, vinh-huy ngo, huy ngo, huy, cybersecurity, Santa Clara University" />
        <meta property="og:type" content="website" />
        <link rel="icon" type="image/png" href="/images/Github-Logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
