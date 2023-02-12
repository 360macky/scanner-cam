import React from 'react'
import classNames from 'classnames'
import Webcam from 'react-webcam'
import useWindowOrientation from 'use-window-orientation'
import { isMobile } from 'react-device-detect'
import { CAMERA_MODE } from '../types/initialState'

interface WebcamCoreModuleProps {
  webcamRef: React.RefObject<Webcam>
  videoConstraints: { facingMode: CAMERA_MODE }
  cameraMode: CAMERA_MODE
}

const WebcamCoreModule = ({
  webcamRef,
  videoConstraints,
  cameraMode
}: WebcamCoreModuleProps) => {
  const { portrait, landscape } = useWindowOrientation()
  return (
    <Webcam
      id="webcam"
      ref={webcamRef}
      muted={true}
      className={classNames('Webcam-module rounded-[2rem] lg:h-auto absolute', {
        'h-auto': portrait && isMobile,
        'h-screen': landscape && isMobile,
        'ml-0': landscape && isMobile,
        'ml-auto': !isMobile
      })}
      videoConstraints={{
        ...videoConstraints,
        facingMode: cameraMode
      }}
    />
  )
}

export default WebcamCoreModule
