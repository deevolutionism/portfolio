import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Pagination from '../components/Pagination'
import PostList from '../components/PostList'
import utilStyles from '../styles/utils.module.css'
import { getPaginatedPostsData } from '../lib/posts'

// interface PostData {
//   id: string; date: string; title: string; image: string; tags:string[];
// }

// interface AllPostData {
//   allPostsData: PostData[]
// }

export async function getStaticProps() {
  const { posts, pagination } = getPaginatedPostsData()

  return {
    props: {
      pagination,
      posts,
    },
  }
}

export default function Home({ posts, pagination }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>👋 I&apos;m a Generalist</p>
        <p>
          🌐 <a href="https://github.com/deevolutionism">Github</a>
        </p>
        <p>I enjoy researching and playing around with various technologies, tools, and software.</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <PostList posts={posts} />
        <Pagination pagination={pagination} />
      </section>
    </Layout>
  )
}
