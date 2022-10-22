<p align="center">
  <img
    src=".github/logo.png"
    align="center"
    width="100"
    alt="Scanner Cam"
    title="Scanner Cam"
  />
  <h1 align="center">📸 Scanner Cam 🔊</h1>
</p>

<p align="center">
  📸 Camera object recognizer with object-to-voice integrated. 🤖
</p>

![Demo of ScannerCam](./.github/demo.gif)

## 🛠 Development

**ScannerCam** is a web application that contains a camera module (capable of reverting to environment camera and front camera on mobile devices) whose frames are fed in real time to the COCO-SSD model (COCO stands for [Common Objects In Context](https://cocodataset.org/#home)) (SSD stands for [Single Shot MultiBox Detection](https://arxiv.org/abs/1512.02325)) of [TensorFlow.js](https://www.tensorflow.org/js) computer vision to detect up to 80 object classes.

![SSD: Single Shot MultiBox Detector](./.github/ssd-paper.jpg)

> "We present a method for detecting objects in images using a single deep neural network. Our approach, named SSD, discretizes the output space of bounding boxes into a set of default boxes over different aspect ratios and scales per feature map location." From the [SSD: Single Shot MultiBox Detector](https://arxiv.org/abs/1512.02325) paper.


It also uses the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) to talk about objects detected on camera while the option is active. This feature is called object-to-voice.

Both features have language internationalization support in English and Spanish. The language change happens by the user's preferred language in the browser.

The interface was built on [React v18](https://reactjs.org/blog/2022/03/29/react-v18.html) and [TailwindCSS](https://tailwindcss.com). It is responsive. And it's also available with a beautiful light and dark mode.

## 🎨 UI Design
The colors chosen to paint Scanner Cam are shades of red that change depending on the user's preference in dark mode and light mode.

- Red darker: `#6A0012`
- Red dark: `#A00037`
- Red candydark: `#D81B60`
- Red candylight: `#FF5C8D`
- Red light: `#FF90BD`
- Red lighter: `#FFC2EF`

## 🤲 Contributing

Do you would like to contribute? Do you want to be the author of a new feature? Awesome! please fork the repository and make changes as you like. [Pull requests](https://github.com/360macky/scanner-cam/pulls) are warmly welcome.

## 📃 License

Distributed under the MIT License.

See [`LICENSE`](./LICENSE) for more information.
