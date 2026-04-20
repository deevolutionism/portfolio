import { getAllPostIds, getPostData } from '../../lib/posts';
import Layout from '../../components/layout'
import Head from 'next/head';
import Date from "../../components/date"
import utilStyles from '../../styles/utils.module.css';
import {Tags} from "../../components/Tags"
import MarkdownContent from '../../components/MarkdownContent'
import ExpandableImage from '../../components/ExpandableImage'

// import { useRouter } from 'next/router'

// const Post = () => {
//   const router = useRouter()
//   const { pid } = router.query
//   console.log(router.query)

//   return <p>Post: {pid}</p>
// }
export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

function Post({ postData }) {
  const imageSrc = typeof postData.image === 'string' ? postData.image.trim() : ''

  return (
    <Layout>
      <Head>
        <title>{postData?.title}</title>
      </Head>
      <article>
        {imageSrc && (
          <ExpandableImage
            src={imageSrc}
            className={utilStyles.imageHeader}
            title="post image header"
            alt={`${postData.title} image`}
            width="600"
            height="300"
            loading="eager"
          />
        )}
        <h1 className={utilStyles.headingXl}>{postData?.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <Tags tags={postData.tags} />
        <MarkdownContent html={postData?.contentHtml || ''} />
      </article>
    </Layout>
  );
}

export default Post
