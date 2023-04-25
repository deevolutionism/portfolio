import { getAllPostIds, getPostData } from '../../lib/posts';
import Layout from '../../components/layout'
import Head from 'next/head';
import Date from "../../components/date"
import utilStyles from '../../styles/utils.module.css';
import {Tags} from "../../components/Tags"
import Image from 'next/image'

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <Image src={postData.image} className={utilStyles.imageHeader} title="post image header" alt="image" width="600" height="300"/>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

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