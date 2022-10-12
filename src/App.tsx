import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import classNames from "classnames";
import useWindowOrientation from "use-window-orientation";
import { useTranslation } from "react-i18next";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { isMobile } from "react-device-detect";

import "./App.css";

import Logo from "./assets/logo.png";
import VolumeOff from "./assets/icons/volume_off.svg";
import VolumeOn from "./assets/icons/volume_on.svg";
import VideocamOff from "./assets/icons/videocam_off.svg";
import Videocam from "./assets/icons/videocam.svg";
import CameraSwitch from "./assets/icons/cameraswitch.svg";
import WelcomeLogo from "./assets/welcome-icon.svg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import isiOS from "./utils/isiOS";

import { CAMERA_MODE } from "./ui";

let _speechSynth: any;
let _voices: any;
const _cache: any = {};

function loadVoicesWhenAvailable(onComplete = () => {}) {
  _speechSynth = window.speechSynthesis;
  const voices = _speechSynth.getVoices();

  if (voices.length !== 0) {
    _voices = voices;
    onComplete();
  } else {
    return setTimeout(function () {
      loadVoicesWhenAvailable(onComplete);
    }, 100);
  }
}

function getVoices(locale: any) {
  if (!_speechSynth) {
    window.alert("Browser does not support speech synthesis");
    throw new Error("Browser does not support speech synthesis");
  }
  if (_cache[locale]) return _cache[locale];

  _cache[locale] = _voices.filter((voice: any) => voice.lang === locale);
  return _cache[locale];
}

function playByText(locale: any, text: string, onEnd?: any) {
  const voices = getVoices(locale);

  const utterance = new window.SpeechSynthesisUtterance();
  utterance.voice = voices[0];
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 0.8;
  utterance.text = text;
  utterance.lang = locale;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  // Cancel current speaking if there is one running.
  _speechSynth.cancel();
  _speechSynth.speak(utterance);
}

loadVoicesWhenAvailable(function () {
  console.log("voices loaded");
});

let detectionsStorage: string[] = [];

const waitUpdate = async (time = 3000) =>
  new Promise((res) => setTimeout(res, time));

let voiceActivated = false;

function App() {
  const { t } = useTranslation();
  const webcamRef = useRef(null);
  const tensorGramRef = useRef<HTMLDivElement>(null);
  const { portrait, landscape } = useWindowOrientation();
  const [neuralNetwork, setNeuralNetwork] = useState<any>(null);
  const [webcamLoaded, setWebcamLoaded] = useState<boolean>(false);

  const [detections, setDetections] = useState<any[]>([]);
  const [webcamOn, setWebcamOn] = useState<boolean>(false);
  const [voiceUI, setVoiceUI] = useState<boolean>(false);

  const videoConstraints = {
    facingMode: CAMERA_MODE.USER,
  };
  const [facingMode, setFacingMode] = useState(CAMERA_MODE.USER);

  type ScannerDetection = {
    bbox: any;
    class: string;
    score: any;
  };

  const createTensorgram = (detections: ScannerDetection[]) => {
    const tensorgram = document.getElementById("tensorgram") as HTMLDivElement;
    tensorgram.replaceChildren();
    detections.forEach((detection: ScannerDetection) => {
      const [x, y, width, height] = detection["bbox"];
      const text = detection["class"];

      const frameDetect = document.createElement("div");
      const frameLabelContainer = document.createElement("div");
      const frameLabelText = document.createElement("p");
      frameLabelText.innerText = text;
      frameLabelContainer.appendChild(frameLabelText);
      frameDetect.appendChild(frameLabelContainer);
      frameDetect.classList.add("tensorframe");
      frameDetect.style.position = "absolute";

      const videoSelected = document.getElementById(
        "webcam"
      ) as HTMLVideoElement;
      const tensorGram = document.getElementById(
        "tensorgram"
      ) as HTMLDivElement;

      const clientWidth = tensorGram.clientWidth;
      const videoWidth = videoSelected.videoWidth;
      const clientHeight = tensorGram.clientHeight;
      const videoHeight = videoSelected.videoHeight;

      frameDetect.style.width = `${(width * clientWidth) / videoWidth}px`;
      frameDetect.style.height = `${(height * clientHeight) / videoHeight}px`;
      frameDetect.style.left = `${(x * clientWidth) / videoWidth}px`;
      frameDetect.style.top = `${(y * clientHeight) / videoHeight}px`;

      tensorgram.appendChild(frameDetect);
    });
  };

  useEffect(() => {
    (async () => {
      const network = await cocossd.load();
      setNeuralNetwork(network);
    })();
    return () => {};
  }, []);

  const handleRevertCameraMode = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === CAMERA_MODE.USER
        ? CAMERA_MODE.ENVIRONMENT
        : CAMERA_MODE.USER
    );
  }, []);

  useEffect(() => {
    let f = async () => {
      while (voiceActivated) {
        await waitUpdate(
          detectionsStorage.length === 1
            ? 5000
            : detectionsStorage.length * 3000
        );

        if (detectionsStorage.length > 0) {
          if (typeof parseObjects(detectionsStorage) !== "undefined") {
            const detectionMessage = `${t("identifyprefix")} ${parseObjects(
              detectionsStorage
            )}.`;
            if (voiceActivated) {
              playByText(navigator.language, detectionMessage);
            }
          }
        }
      }
    };
    f();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceUI]);

  const detect = async (net: any) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current["video"]["readyState"] === 4
    ) {
      const video = webcamRef.current["video"] as HTMLVideoElement;

      if (!webcamLoaded) {
        setWebcamLoaded(true);
      }
      if (webcamLoaded) {
        const cocoDetections = await net.detect(video);
        const parsedDetections = cocoDetections.map(
          (detection: any) => detection.class
        );
        const translatedDetections = cocoDetections.map((detection: any) => {
          return {
            bbox: detection.bbox,
            class: t(detection.class),
            score: detection.score,
          };
        });
        if (detections.join() === parsedDetections.join()) {
          detectionsStorage = [];
        } else {
          detectionsStorage = parsedDetections;
        }
        createTensorgram(translatedDetections);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (neuralNetwork) {
        detect(neuralNetwork);
      }
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neuralNetwork, webcamLoaded, detections]);

  useEffect(() => {
    if (webcamRef.current && webcamLoaded) {
      const videoElement = webcamRef.current["video"] as HTMLVideoElement;
      const { clientHeight, clientWidth } = videoElement;
      const tensorGramVideo = tensorGramRef.current as HTMLDivElement;

      tensorGramVideo.style.width = `${clientWidth}px`;
      tensorGramVideo.style.height = `${clientHeight}px`;
    }
    return () => {};
  }, [webcamLoaded, webcamRef, portrait, landscape]);

  const parseObjects = (objects: string[]) => {
    let translatedObjects = objects.map((object) => t(`${object}.noun`));
    if (translatedObjects.length === 1) {
      return translatedObjects.toString();
    } else {
      const resObjects =
        translatedObjects.slice(0, -1).join(", ") +
        `, ${t("objectconnector")} ` +
        translatedObjects.slice(-1)[0];
      return resObjects;
    }
  };

  const handleVoiceActivation = async () => {
    if (isiOS()) {
      window.alert(t("error.ios.voice"));
      return;
    }
    setVoiceUI(!voiceActivated);
    voiceActivated = !voiceActivated;
  };

  const handleCameraActivation = () => {
    // When the camera is about to turn off, also turn off the object-to-voice.
    if (webcamOn) {
      voiceActivated = false;
      setVoiceUI(false);
    }
    setWebcamOn(!webcamOn);
    setDetections([]);
    const tensorGram = document.getElementById("tensorgram") as HTMLDivElement;
    tensorGram.replaceChildren();
  };

  const ObjectToVoiceButton = () => {
    return (
      <button
        title={voiceActivated ? t("turn.on.voice") : t("turn.off.voice")}
        className="bg-[white] dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem]"
        onClick={handleVoiceActivation}
      >
        {voiceActivated ? (
          <img
            src={VolumeOn}
            alt={t("turn.off.voice")}
            className="h-[2.5rem] lg:h-[1.7rem]"
          />
        ) : (
          <img
            src={VolumeOff}
            alt={t("turn.on.voice")}
            className="h-[2.5rem] lg:h-[1.7rem]"
          />
        )}
      </button>
    );
  };

  return (
    <div className="app h-full lg:min-h-screen bg-[black] lg:bg-[white] lg:dark:bg-reddark">
      <header
        className={classNames(
          "bg-[black] lg:bg-redcandydark lg:dark:bg-reddarker lg:flex lg:justify-center h-[2.6rem] lg:h-auto lg:py-[0.4rem] sticky top-0",
          { hidden: landscape && isMobile }
        )}
      >
        <img
          src={Logo}
          alt="Scanner Cam"
          className="transition-all hover:rotate-180 hidden lg:block lg:h-[2.5rem]"
        />
      </header>
      <div
        className={classNames(
          "rounded-lg bg-[black] lg:bg-opacity-0 flex items-end lg:justify-center lg:w-full lg:pt-[2.6rem]",
          {
            "h-full w-[calc(100vw-7rem)]": landscape && isMobile,
            "justify-center w-full min-h-full items-center h-[calc(100vh-16rem)]":
              !landscape && isMobile,
          }
        )}
      >
        <div
          className={classNames(
            "Webcam-module flex flex-col justify-center lg:pt-5 w-[640px] bg-[black] rounded-[2rem] ",
            {
              "ml-0 h-screen": landscape && isMobile,
              "ml-auto lg:h-[480px]": !isMobile,
            }
          )}
          style={{}}
        >
          <img
            src={WelcomeLogo}
            alt={t("welcome.message")}
            className="welcome hidden lg:block"
          />
          <h2 className="text-redlighter text-2xl lg:text-3xl font-bold">
            {t("welcome.message")}
          </h2>
          <h2 className="text-[white] text-lg">{t("welcome.description")}</h2>
        </div>
        {webcamOn && (
          <Webcam
            id="webcam"
            ref={webcamRef}
            muted={true}
            className={classNames(
              "Webcam-module rounded-[2rem] lg:h-auto absolute",
              {
                "h-auto": portrait && isMobile,
                "h-screen": landscape && isMobile,
                "ml-0": landscape && isMobile,
                "ml-auto": !isMobile,
              }
            )}
            videoConstraints={{
              ...videoConstraints,
              facingMode,
            }}
          />
        )}

        <div
          id="tensorgram"
          className={classNames("tensorgram", {
            "w-[calc(100vw-7rem)]": isMobile,
          })}
          ref={tensorGramRef}
          style={{
            height: "auto",
            width: "auto",
          }}
        ></div>
        <div className="absolute lg:flex justify-between hidden w-[36rem] pb-[1.25rem] z-10">
          <ObjectToVoiceButton />
          <button
            onClick={handleCameraActivation}
            title={webcamOn ? t("turn.off.camera") : t("turn.on.camera")}
            className="bg-[white] dark:bg-redlight transition hover:scale-110 rounded-full p-[0.8rem]"
          >
            {webcamOn ? (
              <img
                src={Videocam}
                alt={t("turn.off.camera")}
                className="h-[2.5rem] lg:h-[1.7rem]"
              />
            ) : (
              <img
                src={VideocamOff}
                alt={t("turn.on.camera")}
                className="h-[2.5rem] lg:h-[1.7rem]"
              />
            )}
          </button>
        </div>
      </div>
      <footer
        className={classNames(
          " w-full px-[1.2rem] py-[1rem] fixed left-0 bottom-0 flex justify-between text-white text-2xl bg-redcandydark lg:hidden lg:flex-row z-30",
          {
            "w-auto flex-col right-0 left-auto h-full rounded-[2.8rem]":
              landscape,
            "rounded-t-[2.8rem] h-auto": !landscape,
          }
        )}
      >
        <button
          title={voiceActivated ? t("turn.off.voice") : t("turn.on.voice")}
          className="bg-redlight rounded-full p-[0.8rem]"
          onClick={handleVoiceActivation}
        >
          {voiceActivated ? (
            <img src={VolumeOn} alt="Volume off" className="h-[2.5rem]" />
          ) : (
            <img src={VolumeOff} alt="Volume off" className="h-[2.5rem]" />
          )}
        </button>
        <button
          title={t("revert.camera")}
          className={classNames(
            "transition-all bg-redlight rounded-full p-[0.8rem]",
            {
              "opacity-0": !webcamOn,
              "opacity-100": webcamOn,
            }
          )}
          onClick={handleRevertCameraMode}
        >
          <img
            src={CameraSwitch}
            alt={t("revert.camera")}
            className="h-[2.5rem] transition-all duration-700"
            style={{
              transform: `rotateY(${
                facingMode === CAMERA_MODE.USER ? 180 : 0
              }deg)`,
            }}
          />
        </button>
        <button
          title={t("revert.camera")}
          className="bg-redlight rounded-full p-[0.8rem]"
          onClick={handleCameraActivation}
        >
          {webcamOn ? (
            <img
              src={Videocam}
              alt={t("revert.camera")}
              className="h-[2.5rem]"
            />
          ) : (
            <img
              src={VideocamOff}
              alt={t("revert.camera")}
              className="h-[2.5rem]"
            />
          )}
        </button>
      </footer>
    </div>
  );
}

export default App;
