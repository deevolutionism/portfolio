import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import Pagination from '../../components/Pagination'
import PostList from '../../components/PostList'
import utilStyles from '../../styles/utils.module.css'
import { getPaginatedPostPaths, getPaginatedPostsData } from '../../lib/posts'

export async function getStaticProps({ params }) {
  const { posts, pagination } = getPaginatedPostsData(params.page)

  return {
    props: {
      pagination,
      posts,
    },
  }
}

export async function getStaticPaths() {
  return {
    paths: getPaginatedPostPaths(),
    fallback: false,
  }
}

export default function PaginatedPosts({ posts, pagination }) {
  return (
    <Layout home>
      <Head>
        <title>{`${siteTitle} - Page ${pagination.currentPage}`}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <PostList posts={posts} />
        <Pagination pagination={pagination} />
      </section>
    </Layout>
  )
}
