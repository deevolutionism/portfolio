import Image from 'next/image'
import Link from 'next/link'
import Date from './date'
import { Tags } from './Tags'
import utilStyles from '../styles/utils.module.css'

export default function PostList({ posts }) {
  return (
    <ul className={utilStyles.list}>
      {posts.map(({ id, date, title, image, tags }) => (
        <li className={utilStyles.listItem} key={id}>
          <Image src={image} className={utilStyles.imageHeader} title="post image header" alt="image" width="600" height="300" />
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
  )
}
