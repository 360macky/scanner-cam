import React from 'react'
import classNames from 'classnames'
import { isMobile } from 'react-device-detect'

interface TensorgramProps {
  tensorGramRef: React.RefObject<HTMLDivElement>
}

const Tensorgram = ({ tensorGramRef }: TensorgramProps) => {
  return (
    <div
      id="tensorgram"
      className={classNames('tensorgram', {
        'w-[calc(100vw-7rem)]': isMobile
      })}
      ref={tensorGramRef}
      style={{
        height: 'auto',
        width: 'auto'
      }}
    ></div>
  )
}

export default Tensorgram
