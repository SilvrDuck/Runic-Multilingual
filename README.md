# The Tunic Translator Tool - Multilingual Fork

> **This is a fork of [aryanpingle/Runic](https://github.com/aryanpingle/Runic) ([live site](https://aryanpingle.github.io/Runic/)).**
> This fork adds **multilingual support**: source text in any supported language is converted to phonemes in-browser using eSpeak-ng, then mapped to the closest Tunic-rune phonemes, so you can transliterate words from English, French, or German. Adding more languages is straightforward - see [`src/languages/README.md`](src/languages/README.md).

<p align="center">
    <a href="https://silvrduck.github.io/Runic-Multilingual/"><strong>Live Site</strong></a>
</p>

<p align="center">
    <img src="./public/images/banner.jpg" alt="Banner image showing off Runic">
</p>

Tunic is a beautiful video game about a small fox in a big world. It has its own written language, which players will not understand.<br>

However - through the efforts of the community - this language has finally been translated and understood.

This website is my love letter to Tunic, and its awesome community - [The Runic Website](https://aryanpingle.github.io/Runic/), Tunic's ultimate translation tool.

## Development

Clone this repository:

```bash
$ git clone https://github.com/aryanpingle/Runic.git
$ cd Runic
```

Install node packages:

```bash
$ npm ci
```

Use `npm run dev` to transpile the code into JS. The `dist` directory will contain the copied assets, and generated code, including `index.html` - and will watch for changes.

Use `npm run build` to generate the minified, bundled code in `dist/`.

### Adding a language

Runic is multilingual: source text is converted to phonemes in-browser
(eSpeak-ng) and mapped to the closest Tunic-rune phonemes. To add a language,
see [`src/languages/README.md`](src/languages/README.md).
