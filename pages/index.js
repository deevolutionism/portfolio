import Head from 'next/head'
import Image from 'next/image'
import Layout, { siteTitle } from '../components/layout'
import {Tags} from '../components/Tags'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts';
import Link from "next/link";
import Date from "../components/date"

// interface PostData {
//   id: string; date: string; title: string; image: string; tags:string[];
// }

// interface AllPostData {
//   allPostsData: PostData[]
// }

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({allPostsData}) {
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
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title, image, tags }) => (
            <li className={utilStyles.listItem} key={id}>
              <Image src={image} className={utilStyles.imageHeader} title="post image header" alt="image" width="600" height="300"/>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
              <br />
              <Tags tags={tags} />
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
