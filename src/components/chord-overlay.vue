<template>
    <div id="chord-overlay">
        <h2>{{ chord.name }}</h2>
        <chord-shape v-for="(shape, index) in shapes"
                     :key="`shape${index}`"
                     :first-string="shape.firstString"
                     :first-fret="shape.firstFret"
                     :fretted-notes="shape.frettedNotes"
                     :visible-frets="visibleFrets"
                     class="chord-shape"
        />
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ChordShape from './chord-shape';

// the frets from which we will start calculating our chords (0 = open chord)
const STARTING_FRETS = [0, 2, 4, 6, 8, 10];
// the amount of frets we support in a single shape
const OCTAVE = 12;

export default {
    components: {
        ChordShape
    },
    props: {
        chord: {
            type: Object,
            required: true
        },
    },
    data: () => ({
        shapes: [], // will be rendered on mount
        // TODO: allow more frets for shorter scale instruments (e.g. ukelele)?
        // or at a higher fret range (e.g. beyond 12th)?
        visibleFrets: 4,
    }),
    computed: {
        ...mapState([
            'tuning',
            'notes',
        ]),
        ...mapGetters([
            'fretRange',
            'isPowerChord',
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
    },
    mounted() {
        this.renderShapes();
    },
    methods: {
        renderShapes() {
            STARTING_FRETS.forEach(fret => {
                const shape = this.frettedNotes(fret);
                // do not show if chord could not be resolved
                if (!shape || shape.frettedNotes.length < this.chord.notes.length) {
                    return;
                }
                // add rendered shape to shapes list (if it hadn't been resolved yet...)
                const shapeNotes = JSON.stringify(shape.frettedNotes);
                if (this.shapes.find(existingShape => shapeNotes === JSON.stringify(existingShape.frettedNotes))) {
                    return;
                }
                this.shapes.push(shape);
            });
        },
        /**
         * Get all frets used to represent the chord
         * across all strings
         */
        frettedNotes(requestedFret) {
            // prevent recursing too much when fret start offset is getting ridiculously high
            // (either chord cannot be resolved for tuning or the fret sizes are getting uncomfortable)
            if (isNaN(requestedFret) || requestedFret > 1.25 * OCTAVE ) {
                return null;
            }
            const { firstFret, fretStartOffset, firstString } = this.getRootNoteStartFret(requestedFret);
            const frettedNotes = new Array(this.strings.length);
            const foundNotes = [this.chordRoot];
            const range = this.fretRange(firstFret, this.visibleFrets);
            const lastFret = range[range.length - 1];
            frettedNotes[firstString] = firstFret;

            for (let string = firstString + 1; string < this.strings.length; ++string) {
                const frets = this.fretsForString(string, firstFret);
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
                        if (fret < lastFret && !this.hasLowerFrettedNoteOnHigherString(note, fret, string)) {
                            foundNotes.push(note);
                            frettedNotes[string] = fret;
                            break;
                        }
                    }
                }
                // in case note had been fretted before, allow the last known fret
                // to duplicate the note
                if (!frettedNotes[string]) {
                    frettedNotes[string] = frets[0];
                }
                // for power chords we allow doubling of the octave note and that's it
                if (this.isPowerChord(this.chord) && foundNotes.length > 3) {
                    break;
                }
            }
            // in case not all notes have been mined, the current fret range
            // won't work for us try again at a higher offset
            if (foundNotes.length < this.chord.notes.length) {
                return this.frettedNotes(requestedFret + this.visibleFrets);
            }
            return { firstString, firstFret, frettedNotes };
        },
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
        fretsForString(stringIndex, firstFret) {
            const openStringNote = this.strings[stringIndex];
            const frets = [];
            for (let fret = firstFret; fret <= firstFret + OCTAVE; ++fret) {
                const note = this.getNoteByFret(fret, openStringNote);
                if (this.chord.notes.includes(note) && fret >= firstFret && fret <= ( firstFret + this.visibleFrets )) {
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
        },
        getRootNoteStartFret(fretStartOffset) {
            let found = [];
            this.strings.forEach(openStringNote => {
                for (let fret = fretStartOffset; fret < OCTAVE + fretStartOffset; ++fret) {
                    const note = this.getNoteByFret(fret, openStringNote);
                    if ( note === this.chordRoot) {
                        found.push(fret);
                    }
                }
            });
            // only consider the first three strings for the root note
            // TODO: what about those 8 and 9 strings??
            found = found.slice(0, 3);
            const firstString = fretStartOffset > 7 ? 0 : found.indexOf(Math.min.apply(Math, found));

            /**
             * Get the fret number of the first strings root note
             * this determines the position at which the chord starts and thus
             * the visible fret range
             */
            const string = firstString;
            let firstFret = -1;
            for (let fret = fretStartOffset; fret < OCTAVE + fretStartOffset; ++fret) {
                const note = this.getNoteByFret(fret, this.strings[string]);
                if (note === this.chordRoot) {
                    firstFret = fret;
                }
            }
            firstFret = Math.max(firstFret, fretStartOffset);
            return { firstFret, fretStartOffset, firstString };
        },
    }
};
</script>

<style lang="scss" scoped>
    #chord-overlay {
        position: fixed;
        top: 50px;
        left: 50%;
        border: 3px solid #000;
        border-radius: 7px;
        background-color: rgba(255,200,200,.90);
        width: 50%;
        margin-left: -25%;
        height: 250px;
        pointer-events: none;
    }

    .chord-shape:not(:first-child) {
        margin-left: 30px;
    }
</style>
