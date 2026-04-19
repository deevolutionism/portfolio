import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'

function getPageHref(page) {
  return page === 1 ? '/' : `/page/${page}`
}

export default function Pagination({ pagination }) {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <nav className={utilStyles.pagination} aria-label="Blog pagination">
      {pagination.hasPreviousPage ? (
        <Link className={utilStyles.paginationLink} href={getPageHref(pagination.previousPage)}>
          Previous
        </Link>
      ) : (
        <span className={utilStyles.paginationDisabled}>Previous</span>
      )}
      <span className={utilStyles.paginationStatus}>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      {pagination.hasNextPage ? (
        <Link className={utilStyles.paginationLink} href={getPageHref(pagination.nextPage)}>
          Next
        </Link>
      ) : (
        <span className={utilStyles.paginationDisabled}>Next</span>
      )}
    </nav>
  )
}
