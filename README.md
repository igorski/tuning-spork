# guitar scale visualizer

A web based application that allows you to visualize the notes and chords of a large selection of scales
onto your fretboard with support for custom tunings / strings.

## Architecture

The project was created using [Vue](https://vuejs.org) with the following tools/plugins:

* Webpack
* Babel transpiler
* Vuex
* PWA support
* ESLint
* Jest unit testing

## Development

Configuration boilerplate generated with [Vue-CLI 3](https://cli.vuejs.org/config/). Resolve dependencies using _npm install_.

### Commands

Launches a local web server (available at _localhost:8080_) serving the application with live compilation and hot reload for development:

```
npm run serve
```

Compile and minify application for production deployment (output wil be written to _./dist/_-folder):

```
npm run build
```

Lint and fix source code:

```
npm run lint
```

Run unit tests:

```
npm run test:unit
```

## Adding new scales / chords

Scales and chords are described in JSON fixtures which are located in _./src/definitions/_.
Scales and chords are defined by their name and by the notes present:

Scale example:

```
{
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10]
}
```

Where the object key is the scale name and the Array value describes all notes within said scale. These
notes are defined as _semitones_ (where integer values are used for _equal temperament_ tunings). Note: always
start with a 0 to define the root note.

Chord example:

```
{
    "major": [0, 4, 7],
    "major 7th": [0, 4, 7, 11],
    "minor": [0, 3, 7],
    "minor 7th": [0, 3, 7, 10]
}
```

The visualiser interface will use these notes to generate scales from a given root note for each individual
guitar string.

## Roadmap

* Show all chords that belong to a chosen scale
* List of tunings to select from
* Fancy stylesheet
* "Name my chord" (draw a chord on the fretboard and get the chord name and compatible scales)
