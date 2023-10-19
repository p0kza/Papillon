<br/>
<p align="center">
  <a href="https://github.com/PapillonApp/Papillon">
    <img src="https://i.ibb.co/BL8qgJQ/image.png" alt="Logo" width="96" height="96">
  </a>
  <h1 align="center">Papillon — Votre vie scolaire</h1>

  <p align="center">
    Your timetable, homeworks, grades, news and more in a fresh new UI for any French school service.
    <br/>
    <br/>
    <a href="https://docs.getpapillon.xyz/"><strong>Explore the docs »</strong></a><br><br>
    <i>Read this in other languages: <a href="https://github.com/Ahhj93/Papillon/blob/development/README.md" align="center">Français<a/>, <a href="https://github.com/Ahhj93/Papillon/blob/development/README.en.md" align="center">English<a/></i>
  </p>

  <div class="badges" align="center">
        <img alt="Downloads" src="https://img.shields.io/github/downloads/PapillonApp/Papillon/total">
        <img alt="Contributors" src="https://img.shields.io/github/contributors/PapillonApp/Papillon?color=dark-green">
        <img alt="Issues" src="https://img.shields.io/github/issues/PapillonApp/Papillon">
        <img alt="License" src="https://img.shields.io/github/license/PapillonApp/Papillon">
        <br />
        <a href="https://discord.gg/vFmCwSzvAp">
            <img src="https://img.shields.io/badge/Discord-Rejoindre-5865F2?style=flat&amp;logo=discord&amp;logoColor=white" alt="Join our Discord server">
        </a>
        <a href="https://www.instagram.com/thepapillonapp/">
            <img src="https://img.shields.io/badge/Instagram-thepapillonapp-E4405F?style=flat&amp;logo=instagram&amp;logoColor=white" alt="Follow us on Instagram">
        </a>
    </div>
</p>



## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Screenshots](#screenshots)
- [Built With](#built-with)
- [Getting Started](#getting-started)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
	- [Creating A Pull Request](#creating-a-pull-request)
- [License](#license)
- [Authors](#authors)
- [Acknowledgements](#acknowledgements)

## About The Project

* **Features of Pronote**
    - 📆 Timetable
        + Intuitive time management
        + Addition to the calendar
        + Customised courses
        + Notifications
    - 📑 Homeworks
        + Intuitive management of your work schedule
    - 🎓 Grades and skills
        + Overall and class averages
        + Automatic resetting of scores out of 20
        + Intuitive grid display
    - 📂 Course content and files
    - 📰 News
    - 🚪 Absences, lateness and sanctions
* **An incredible interface**
    - 🎨 Designed with care and precision
    - ✋ Ready for one-handed use
        + Use of intuitive gestures
    - ✨ Continuously improves with regular updates
    - 📱 Native look for iOS and Android
* **Extensions and customisation**
    - 🕺 Customisable font and interface colour
    - 🤯 Extends the functionality of the app

## Screenshots

### iPhone XR (iOS 16.3.1) (version 5.7.0 - light mode)
|Home|Timetable|Homework|Grades|Settings|
|--|--|--|--|--|
|![Home](https://media.discordapp.net/attachments/1001198944220627025/1110961162067116072/IMG_3352.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961162360729600/IMG_3353.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961162729816204/IMG_3354.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961163065372743/IMG_3356.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961163413487636/IMG_3357.png)|

## Built With

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Ionic](https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

First, grab a copy of this repo and install the needed dependencies to run Papillon locally.

```sh
npm i
```

### Installation
*PS: In an older version of this file, you had to install the `@ionic/cli` package. This package is no longer needed, and if you installed it only for Papillon, you can remove it with `npm uninstall -g @ionic/cli`.*
*We removed it to fix a bug with "Waiting for connectivity with vue-cli-service" message which was CPU intensive.*
To run papillon, simply run
```sh
npm run serve
```

To build papillon, you need **Android Studio** or *Xcode** installed.
Android SDK or Xcode command line tools needs to be configured. All the prerequisites for building are available on https://capacitorjs.com/docs/getting-started/environment-setup
```sh
npm run build
npx cap sync
# then build using Android Studio or Xcode
```

## Usage

Papillon is useful to any student using Pronote or EcoleDirecte. If their official app is not enough for you, we're here to improve your digital school experience !

## Roadmap

See the [open issues](https://github.com/PapillonApp/Papillon/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to be, learn, inspire, and create. Any contributions you make are **greatly appreciated**.
* If you have suggestions for adding or removing projects, feel free to [open an issue](https://github.com/PapillonApp/Papillon/issues/new) to discuss it, or directly create a pull request after you edit the *README.md* file with necessary changes.
* Please make sure you check your spelling and grammar.
* Create individual PR for each suggestion.
* Please also read through the [Code Of Conduct](https://github.com/PapillonApp/Papillon/blob/development/CODE_OF_CONDUCT.md) before posting your first idea as well.

### Creating A Pull Request

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the GPL-3.0 License. See [LICENSE](https://github.com/PapillonApp/Papillon/blob/development/LICENSE) for more information.

## Authors

* **Vince Linise** - *French student in high school* - [Vince Linise](https://github.com/ecnivtwelve/) - *Creator of Papillon*
* **Lucas** - *French student in high school* - [Lucas](https://github.com/lucas-luchack) - *Active developer*
* **Lucas** - *French student in middle school* - [Lucas](https://github.com/tryon-dev) - *Server management*
* **Nicolas** - *French student in BTS SIO* - [Nicolas](https://github.com/andronedev) - *Active developer*
* **Astrow** - *French student in high school* - [Astrow](https://github.com/Astrow25) - *Developer and tester*

## Acknowledgements

* [bain3/pronotepy](https://github.com/bain3/pronotepy/)
* [Capacitor Community](https://github.com/capacitor-community)
