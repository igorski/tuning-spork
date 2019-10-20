/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Igor Zinken - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import Vue from 'vue';
import Vuex from 'vuex';
import Chords from '@/definitions/chords.json';
import Scales from '@/definitions/scales.json';
import Tunings from '@/definitions/tunings.json';

// reverse the string order
const TUNINGS = Tunings.filter(t => ({ ...t, strings: t.strings.reverse() }));

Vue.use(Vuex);

/* internal methods */

const getTunings = (state) => {
    switch (state.instrumentType) {
        default:
            return TUNINGS.filter(t => t.type === 'guitar');
        case 'bass':
            return TUNINGS.filter(t => t.type === 'bass');
        case 'ukelele':
            return TUNINGS.filter(t => t.type === 'ukelele');
    }
};

const standardTuningForInstrument = (instrumentType, optStringAmount = 0) => {
    return TUNINGS.find(tuning => {
        if (tuning.type !== instrumentType || tuning.name !== 'Standard') {
            return;
        }
        return optStringAmount > 0 ? tuning.strings.length === optStringAmount : tuning;
    });
};

export default new Vuex.Store({
    state: {
        appMode: 0,                     // either 0 (scale visualiser) or 1 (name my chord)
        notes: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        scales: Scales,
        instrumentType: 'guitar',       // 'guitar', 'bass' or 'ukelele'
        tuning: standardTuningForInstrument('guitar', 6), // start as six string
        key: 'E',                       // none more guitar friendly
        scale: Object.keys(Scales)[0],  // TODO: assumption that scales list always has content
        viewOption: 'frets',            // whether to visualise 'frets' or 'notes',
        chordOptions: {
            power: false,
            basic: true,
            extended: false,
        },
        chord: []                       // chord visualised by 'Name my chord'-mode
    },
    getters: {
        availableStringAmountsForCurrentInstrument(state) {
            return getTunings(state).reduce((acc, tuning) => {
                if (!acc.includes(tuning.strings.length)) {
                    acc.push(tuning.strings.length);
                }
                return acc;
            }, []);
        },
        availableTuningsForCurrentStringAmount(state) {
            const currentStringAmount = state.tuning.strings.length;
            return getTunings(state).filter(tuning => tuning.strings.length === currentStringAmount);
        },
        availableScaleNotes(state) {
            // get all notes for the chosen scale in the chosen key
            const notes = [];
            const scale = Scales[state.scale];
            const rootNoteIndex = state.notes.indexOf(state.key);
            scale.forEach(semitone => {
                notes.push(state.notes[(rootNoteIndex + semitone ) % state.notes.length]);
            });
            return notes;
        },
        availableScaleChords(state, getters) {
            const scale = Scales[state.scale];
            const out = [];

            // compare for each available note in the scale
            // whether all known Chords have notes that fit with the scale

            const scaleNotes = getters.availableScaleNotes;

            for (let noteIndex = 0; noteIndex < scale.length; ++noteIndex) {
                const note = scaleNotes[noteIndex];
                Object.keys(Chords).forEach(chordName => {
                    const semitones = Chords[chordName];

                    // ignore chords that contain more notes than we can
                    // fret (e.g. when visualizing for ukelele / bass)
                    if (semitones.length > getters.availableStringAmountsForCurrentInstrument) {
                        return;
                    }
                    const chordNotes = [];

                    // collect all notes for the chord
                    semitones.forEach(semitone => {
                        const chordNoteIndex = state.notes.indexOf(note);
                        chordNotes.push(state.notes[(chordNoteIndex + semitone) % state.notes.length])
                    });

                    for (let i = 0; i < chordNotes.length; ++i) {
                        if (!scaleNotes.includes(chordNotes[i]))
                            return;
                    }
                    out.push({ name: `${note} ${chordName}`, notes: chordNotes });
                });
            }
            return out;
        },
    },
    mutations: {
        setAppMode(state, mode) {
            state.appMode = mode;
        },
        setInstrumentType(state, type) {
            if (state.instrumentType !== type) {
                state.instrumentType = type;
                state.tuning = standardTuningForInstrument(type);
                state.chord = [];
            }
        },
        setKey(state, key) {
            state.key = key;
        },
        setScale(state, scale) {
            state.scale = scale;
        },
        tuneString(state, { index, note }) {
            Vue.set(state.tuning.strings, index, note);
        },
        setTuning(state, tuning) {
            state.tuning = tuning;
        },
        setStandardTuningForStringAmount(state, amount) {
            state.tuning = standardTuningForInstrument(state.instrumentType, amount);
        },
        setViewOption(state, type) {
            state.viewOption = type;
        },
        setChordStringFretIndex(state, { index, value }) {
            Vue.set(state.chord, index, value);
        },
        setChordOption(state, { option, value}) {
            if (/power|basic|extended/.test(option)) {
                state.chordOptions[option] = value;
            }
        },
    },
    actions: {

    }
});
