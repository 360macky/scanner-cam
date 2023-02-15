import classNames from 'classnames'
import React from 'react'

interface PageProps {
  children: React.ReactNode
}

/**
 * @name Page
 * @description A page component that wraps the content in a container as a
 * layout.
 * @component
 */
const Page = ({ children }: PageProps) => {
  return (
    <main
      className={classNames(
        'min-h-[80vh] dark:bg-redblack p-4 py-16 lg:flex justify-center'
      )}
    >
      <div className="max-w-[1020px] bg-[white] dark:text-[white] dark:bg-redblack text-xl rounded-2xl p-8 flex flex-col gap-y-4 lg:flex-row border border-redlight">
        {children}
      </div>
    </main>
  )
}

export default Page
