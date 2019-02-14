import Vue from 'vue';
import Vuex from 'vuex';
import Scales from '../definitions/scales.json';

Vue.use(Vuex);

// notes sorted top to bottom

const BASS_TUNING = [
    ['G', 'D', 'A', 'E'],           // default four string
    ['G', 'D', 'A', 'E', 'B'],
    ['C', 'G', 'D', 'A', 'E', 'B']
];

const GUITAR_TUNING = [
    ['E', 'B', 'G', 'D', 'A', 'E'],            // default six string
    ['E', 'B', 'G', 'D', 'A', 'E', 'B'],
    ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#'],
    ['E', 'B', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']
];

/* internal methods */

const getTunings = (state) => {
    return state.instrumentType === 'bass' ? BASS_TUNING : GUITAR_TUNING;
};

export default new Vuex.Store({
    state: {
        notes: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        scales: Scales,
        instrumentType: 'guitar',       // 'guitar' or 'bass'
        key: 'E',                       // none more guitar friendly
        scale: Object.keys(Scales)[0],  // TODO: assumption that scales have content :p
        tuning: GUITAR_TUNING[0],       // start out as regular six string, notes sorted top to bottom
        viewOption: 'frets',            // 'frets' or 'notes',
    },
    getters: {
        availableStringAmount(state) {
            return getTunings(state).map(tuning => tuning.length);
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
    },
    mutations: {
        setInstrumentType(state, type) {
            state.instrumentType = type;
            state.tuning = getTunings(state)[0].concat();
        },
        setKey(state, key) {
            state.key = key;
        },
        setScale(state, scale) {
            state.scale = scale;
        },
        tuneString(state, { index, note }) {
            Vue.set(state.tuning, index, note);
        },
        setStringAmount(state, amount) {
            state.tuning = getTunings(state).find(tuning => tuning.length === amount).concat();
        },
        setViewOption(state, type) {
            state.viewOption = type;
        }
    },
    actions: {

    }
});
