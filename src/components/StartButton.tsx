import React from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { BROWSER_MODEL_STATUS } from '../types/initialState'
import { motion } from 'framer-motion'

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  title: string
}

const StartButton = ({ onClick, title }: ButtonProps) => {
  const modelStatus: BROWSER_MODEL_STATUS = useSelector(
    (state: RootState) => state.app.modelStatus
  )
  // Opt-out new classname syntax
  // bg-gradient-to-br from-redlightdimmed to-reddark text-white hover:brightness-110 active:ring ring-redlight/60 w-auto self-center rounded-lg px-4 py-2 cursor-pointer text-[1.4rem] lg:text-[1.2rem] font-semibold
  return (
    <motion.button
      initial={{ opacity: 0, scale: 1.2 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, ease: 'easeInOut' }}
      className={classNames(
        'bg-redlighter text-redblack hover:brightness-110 active:ring ring-redlight/60 w-auto self-center rounded-lg px-4 py-2 cursor-pointer text-[1.4rem] lg:text-[1.2rem] font-semibold',
        {
          hidden: modelStatus === 'READY'
        }
      )}
      disabled={modelStatus === 'LOADING'}
      onClick={onClick}
      title={title}
    >
      {title}
    </motion.button>
  )
}

export default StartButton
