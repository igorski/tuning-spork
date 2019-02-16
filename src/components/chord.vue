<template>
    <!-- do not show in case no chord fingering could be resolved -->
    <div v-if="frettedNotes.length >= chord.notes.length" class="chord-wrapper">
        <div class="fretboard"
        >
            <div v-for="(note, stringIndex) in strings"
                 :key="`string_${stringIndex}`"
                 class="string"
                 :style="{ left: `${stringIndex / tuning.length * 100}%` }"
            >
                {{ note }}
                <div v-for="fret in fretRange"
                     :key="fret"
                     class="fret-marker"
                     :style="{ top: `{fret / frets * 100}%`}"
                >
                    {{ stringIndex >= firstString && frettedNotes[stringIndex] === fret ? fret : '' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

const OCTAVE = 12;  // 12 frets in an octave
const VISIBLE_FRETS = 4; // amount of frets to consider in the visible range

export default {
    props: {
        chord: {
            type: Object,
            required: true
        },
        // optional fret at which to start the chord
        fret: {
            type: Number,
            default: 0
        },
    },
    data: () => ({
        fretStartOffset: 0,
        firstFret: 0,
        firstString: 0,
    }),
    computed: {
        ...mapState([
            'tuning',
            'notes',
        ]),
        strings() {
            return [...this.tuning].reverse();
        },
        chordRoot() {
            return this.chord.notes[0];
        },
        chordFifth() {
            // get the fifth in this chord (note: not all chords might have a 5th defined)
            return this.getNoteByFret(7, this.chordRoot);
        },
        fretRange() {
            const out = [];
            for (let i = 0; i <= VISIBLE_FRETS; ++i) {
                out[i] = this.firstFret + i;
            }
            return out;
        },
        lastFret() {
            return this.fretRange[this.fretRange.length - 1];
        },
        /**
         * Get all frets used to represent the chord
         * across all strings
         */
        frettedNotes() {
            // prevent recursing too much when fret start offset is getting ridiculously high
            // (either chord cannot be resolved for tuning or the fret sizes are getting uncomfortable)
            if (this.firstFret > 1.25 * OCTAVE ) {
                return [];
            }
            const frettedStrings = new Array(this.strings.length);
            const foundNotes = [this.chordRoot];
            frettedStrings[this.firstString] = this.firstFret;
            for (let string = this.firstString + 1; string < this.strings.length; ++string) {
                const frets = this.fretsForString(string);
                // reverse loop through the frets
                let j = frets.length;
                let fret, note;
                while (j--) {
                    fret = frets[j];
                    note = this.getNoteByFret(fret, this.strings[string]);
                    // fret string if its note hadn't been fretted yet by a lower string
                    if (!foundNotes.includes(note)) {
                        // check if a higher string is able to fret this note at a lower
                        // fret (meaning the chord is more comfortable on the fingers ;)
                        if (fret < this.lastFret && !this.hasLowerFrettedNoteOnHigherString(note, fret, string)) {
                            foundNotes.push(note);
                            frettedStrings[string] = fret;
                            break;
                        }
                    }
                }
                // in case note had been fretted before, allow the last known fret
                // to duplicate the note
                if (!frettedStrings[string]) {
                    frettedStrings[string] = frets[0];
                }
            }
            // in case not all notes have been mined, the current fret range won't work for us, try again at a higher offset
            if (foundNotes.length < this.chord.notes.length) {
                this.fretStartOffset += VISIBLE_FRETS;
            }
            return frettedStrings;
        },
    },
    watch: {
        fretStartOffset: {
            immediate: true,
            /**
             * chords are always formatted root note first
             * this method returns the first string to contain the root note
             * at the lowest string and fret position
             *
             * TODO: support slash chords ?
             */
            handler() {
                let found = [];
                this.strings.forEach(openStringNote => {
                    for (let fret = this.fretStartOffset; fret < OCTAVE + this.fretStartOffset; ++fret) {
                        const note = this.getNoteByFret(fret, openStringNote);
                        if ( note === this.chordRoot) {
                            found.push(fret);
                        }
                    }
                });
                // only consider the first three strings for the root note
                found = found.slice(0, 3);
                this.firstString = this.fretStartOffset > 7 ? 0 : found.indexOf(Math.min.apply(Math, found));

                /**
                 * Get the fret number of the first strings root note
                 * this determines the position at which the chord starts and thus
                 * the visible fret range
                 */
                const string = this.firstString;
                this.firstFret = -1;
                for (let fret = this.fretStartOffset; fret < OCTAVE + this.fretStartOffset; ++fret) {
                    const note = this.getNoteByFret(fret, this.strings[string]);
                    if (note === this.chordRoot) {
                        this.firstFret = fret;
                    }
                }
                this.firstFret = Math.max(this.firstFret, this.fretStartOffset);
            }
        }
    },
    mounted() {
        this.fretStartOffset = this.fret;
    },
    methods: {
        getNoteByFret(fret, rootNote) {
            const rootNoteIndex = this.notes.indexOf(rootNote);
            const note = this.notes[(rootNoteIndex + fret) % this.notes.length];
            return this.chord.notes.includes(note) ? note : '';
        },
        /**
         * get all the frets on given string that contain a
         * note present in the chord. Note we exclude frets that are
         * outside of the visible fret range
         */
        fretsForString(stringIndex) {
            const openStringNote = this.strings[stringIndex];
            const frets = [];
            for (let fret = this.firstFret; fret <= this.firstFret + OCTAVE; ++fret) {
                const note = this.getNoteByFret(fret, openStringNote);
                if (this.chord.notes.includes(note) && fret >= this.firstFret && fret <= ( this.firstFret + VISIBLE_FRETS )) {
                    frets.push(fret);
                }
            }
            return frets;
        },
        hasLowerFrettedNoteOnHigherString(note, fret, stringIndex) {
            // if note is the fifth we give it precedence to be fretted lower for more OOMPH
            if (note === this.chordFifth) {
                return false;
            }
            for (let string = stringIndex + 1; string < this.strings.length; ++string) {
                const frets = this.fretsForString(string);
                for (let i = 0; i < frets.length; ++i) {
                    const compareFret = frets[i];
                    const compareNote = this.getNoteByFret(compareFret, this.strings[string]);
                    if (compareNote === note && compareFret < fret) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
};
</script>

<style lang="scss" scoped>
    .chord-wrapper {
        display: inline-block;
        width: 120px;
        height: 80px;
        vertical-align: top;
        text-align: center;
    }

    .fretboard {
        position: relative;
        border-right: 1px solid grey;
        height: inherit;
    }

    .string {
        position: absolute;
        color: #000;
        font-weight: bold;
        width: 10px;
        height: 100%;
        top: 0;
        border-left: 1px solid grey;
    }

    .fret-marker {
        display: block;
        width: 20px;
        height: 20px;
    }
</style>
