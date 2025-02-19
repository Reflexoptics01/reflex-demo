  import Head from 'next/head'
  import { NextPage } from 'next'

  const ProductsAndServices: NextPage = () => {
    return (
      <>
        <Head>
          <title>Products and Services</title>
          <meta name="description" content="Our products and services" />
        </Head>
        <main>
        <div style={{
          position: 'relative',
          width: '100%',
          height: 0,
          paddingTop: '56.2225%',
          paddingBottom: 0,
          boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
          marginTop: '1.6em',
          marginBottom: '0.9em',
          overflow: 'hidden',
          borderRadius: '8px',
          willChange: 'transform'
        }}>
          <iframe
            loading="lazy"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              border: 'none',
              padding: 0,
              margin: 0
            }}
            src="https://www.canva.com/design/DAGckFbOYjc/0EBXg4o2W9oEA_f9a2bu-A/view?embed"
            allowFullScreen={true}
            allow="fullscreen"
          >
          </iframe>
        </div>
        <a href="https://www.canva.com/design/DAGckFbOYjc/0EBXg4o2W9oEA_f9a2bu-A/view?utm_content=DAGckFbOYjc&utm_campaign=designshare&utm_medium=embeds&utm_source=link" target="_blank" rel="noopener noreferrer">Products and Services Website</a>
        </main>
      </>
    )
  }

  export default ProductsAndServices
