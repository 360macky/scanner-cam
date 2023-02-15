import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import TensorFlowImage from '../assets/logos/tensorflow.png'
import NextImage from '../assets/logos/next.png'
import ReactImage from '../assets/logos/react.png'

interface FooterProps {
  t: (key: string) => string
}

function Footer({ t }: FooterProps) {
  return (
    <footer className="p-4 bg-white shadow md:flex-col md:items-center md:justify-between md:p-6 md:pb-12 dark:bg-redblackdark">
      <div className="flex justify-between w-full">
        <span className="text-sm text-gray-500 sm:text-center dark:text-white">
          © 2024{' '}
          <Link href="/" className="hover:underline">
            ScannerCam
          </Link>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-white sm:mt-0">
          <li>
            <Link href="/about" className="mr-4 hover:underline md:mr-6">
              About
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex gap-x-2 py-4">
        <Image
          src={TensorFlowImage}
          height={25}
          alt=""
          className="dark:invert"
        />
        <Image src={NextImage} height={25} alt="" className="dark:invert" />
        <Image src={ReactImage} height={25} alt="" className="dark:invert" />
      </div>
    </footer>
  )
}

export default Footer
