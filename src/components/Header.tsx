import React, { useContext } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import { AuthContext } from '../auth/AuthProvider'
import { auth } from '../config/firebase'
import { Disclosure, Menu } from '@headlessui/react'
import { useRouter } from 'next/dist/client/router'
import Image from 'next/image'
import LogoApp from '../assets/applogo.png'
import Profile from '../assets/etc/profile.png'
import HamburgerMenu from '../assets/icons/hamburger-menu.svg'

interface HeaderProps {
  t: (key: string) => string
}

/**
 * @name Header
 * @description Header component is not rendered on mobile devices when the
 * user is in the home page.
 * @param {HeaderProps}
 */
const Header = ({ t }: HeaderProps) => {
  // const { landscape } = useWindowOrientation()
  const router = useRouter()
  const user = useContext(AuthContext)

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    auth.signOut()
    window.location.href = '/'
  }

  const navigation = [
    { name: 'Sign in', href: '/sign-in' },
    { name: 'About', href: '/about' }
  ]

  return (
    <Disclosure
      as="nav"
      className={classNames('bg-gray-100 sticky top-0 sm:block', {
        hidden: router.pathname === '/'
      })}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-200 hover:text-white focus:outline-none">
                  <span className="sr-only">
                    {open ? 'Close main menu' : 'Open main menu'}
                  </span>
                  <Image
                    src={HamburgerMenu}
                    alt="Hamburger Menu"
                    width={20}
                    height={20}
                  />
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-between">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex gap-x-3 items-center">
                    <Image
                      className="h-8 w-auto block"
                      src={LogoApp}
                      alt="ScannerCam logo"
                    />
                    <h1 className="text-reddark font-bold text-2xl hidden sm:block select-none">
                      ScannerCam
                    </h1>
                  </Link>
                </div>
                {!user && (
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="px-3 py-2 rounded-md text-sm font-medium hover:text-redcandydark text-gray-700"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {user && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={user.photoURL === null ? Profile : user.photoURL}
                          alt=""
                          width={32}
                          height={32}
                        />
                      </Menu.Button>
                    </div>
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard"
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                            )}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <span
                            onClick={handleSignOut}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                            )}
                          >
                            Sign out
                          </span>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium active:text-redcandydark hover:bg-gray-200"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Header
