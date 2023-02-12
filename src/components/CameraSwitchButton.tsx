import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../store/appStore'
import { CAMERA_MODE } from '../types/initialState'
import CameraSwitch from '../assets/icons/cameraswitch.svg'

interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const CameraSwitchButton = ({ onClick }: ButtonProps) => {
  const { t } = useTranslation()
  const isWebcamOn: boolean = useSelector(
    (state: RootState) => state.app.isWebcamOn
  )
  const cameraMode: CAMERA_MODE = useSelector(
    (state: RootState) => state.app.cameraMode
  )
  return (
    <button
      title={t('revert.camera')}
      className={classNames(
        'transition-all bg-redlight rounded-full p-[0.8rem] active:bg-redlighter',
        {
          flex: !isWebcamOn
        }
      )}
      disabled={!isWebcamOn}
      onClick={onClick}
    >
      <img
        src={CameraSwitch}
        alt={t('revert.camera')}
        className="h-[2.5rem] transition-all duration-700"
        style={{
          transform: `rotateY(${cameraMode === CAMERA_MODE.USER ? 180 : 0}deg)`
        }}
      />
    </button>
  )
}

export default CameraSwitchButton
