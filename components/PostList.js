import Image from 'next/image'
import Link from 'next/link'
import Date from './date'
import { Tags } from './Tags'
import utilStyles from '../styles/utils.module.css'

export default function PostList({ posts }) {
  return (
    <ul className={utilStyles.list}>
      {posts.map(({ id, date, description, title, image, tags }, index) => {
        const imageSrc = typeof image === 'string' ? image.trim() : ''
        const postDescription = typeof description === 'string' ? description.trim() : ''

        return (
          <li className={utilStyles.listItem} key={id}>
            {imageSrc && (
              <Image
                src={imageSrc}
                className={utilStyles.imageHeader}
                title="post image header"
                alt={`${title} image`}
                width="600"
                height="300"
                loading={index === 0 ? 'eager' : undefined}
              />
            )}
            <Link href={`/posts/${id}`}>{title}</Link>
            {date && (
              <>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </>
            )}
            {postDescription && (
              <p className={utilStyles.postDescription}>{postDescription}</p>
            )}
            <br />
            <Tags tags={tags} />
          </li>
        )
      })}
    </ul>
  )
}
