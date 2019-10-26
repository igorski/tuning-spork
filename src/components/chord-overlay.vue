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
<template>
    <div class="chord-overlay"
         :class="{ tall: shapes.length > 3 }"
    >
        <h2 class="chord-name">{{ chord.name }}</h2>
        <div class="close-button"
             @click="closeOverlay()"
        >&#x2715;</div>
        <template v-if="shapes.length">
            <chord-shape v-for="(shape, index) in sortedShapes"
                         :key="`shape${index}`"
                         :first-string="shape.firstString"
                         :first-fret="shape.firstFret"
                         :fretted-notes="shape.frettedNotes"
                         :visible-frets="visibleFrets"
                         class="chord-shape"
            />
        </template>
        <p v-else
           class="description"
        >
            Could not resolve shapes for {{ chord.name }} for {{ instrumentType }} in {{ tuning.name }} tuning.
            This is either due to the tuning require an impossible chord shape or this application
            requiring further development.
        </p>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { isPowerChord } from '@/utils/chord-util';
import { fretRange } from '@/utils/interval-util';
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
            'instrumentType',
        ]),
        strings() {
            return [...this.tuning.strings].reverse();
        },
        chordRoot() {
            return this.chord.notes[0];
        },
        chordFifth() {
            // get the fifth in this chord (note: not all chords might have a 5th defined)
            return this.getNoteByFret(7, this.chordRoot);
        },
        sortedShapes() {
            // lower frets first
            return [...this.shapes].sort((a, b) => {
                if (a.firstFret < b.firstFret) return -1;
                if (a.firstFret > b.firstFret) return 1;
                return 0;
            });
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
            if (isNaN(requestedFret)) {
                return null;
            }
            const { firstFret, firstString } = this.getRootNoteStartFret(requestedFret);
            if (firstFret >= OCTAVE) {
                return null;
            }

            const frettedNotes = new Array(this.strings.length);
            const foundNotes = [this.chordRoot];
            const range = fretRange(firstFret, this.visibleFrets);
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
                    // if this note hasn't yet been fretted, make this a candidate for fretting
                    if (!foundNotes.includes(note)) {
                        // not so fast though, we need to make sure whether we can comfortably fret this puppy!
                        // is a higher string able to fret this note at a lower fret ?
                        if (!( fret < lastFret && !this.hasLowerFrettedNoteOnHigherString(note, fret, string))) {
                            continue;
                        }
                        foundNotes.push(note);
                        frettedNotes[string] = fret;
                        break;
                    }
                }
                // in case note had been fretted before, allow the last known fret to duplicate the note
                if (!frettedNotes[string]) {
                    // unless this is a large stretch, TODO: only for the lowest frets if we don't expect further notes?
                    const stretch = fret - firstFret;
                    if (stretch > 3) {
                        continue;
                    }
                    frettedNotes[string] = frets[0];
                }
                // for power chords we allow doubling of the octave note and that's it
                if (isPowerChord(this.chord) && frettedNotes.filter(n => typeof n === 'number').length > 2) {
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
                    if (note === this.chordRoot) {
                        found.push(fret);
                    }
                }
            });
            const closest = found.reduce((prev, curr) => {
                return Math.abs(curr - fretStartOffset) < Math.abs(prev - fretStartOffset) ? curr : prev;
            });
            const firstString = found.indexOf(closest);

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
        closeOverlay() {
            this.$emit('close');
        },
    }
};
</script>

<style lang="scss" scoped>
    @import '@/styles/_mixins.scss';
    @import '@/styles/_variables.scss';

    .chord-overlay {
        position: fixed;
        background-color: rgba(255,255,255,.9);
        color: $color-5;
        z-index: $z-index-overlay;
    }

    .chord-name {
        padding-bottom: $spacing-medium;
    }

    .chord-shape {
        display: inline-block;
        margin: $spacing-medium $spacing-large ($spacing-large * 2);
    }

    .description {
        padding: 0 $spacing-small;
    }

    .close-button {
        display: none; // mobile only
    }

    /* anything above mobile view */

    @media screen and ( min-width: $mobile-width ) {
        .chord-overlay {
            top: 50%;
            left: 50%;
            border: 3px solid #000;
            border-radius: 7px;
            width: 50%;
            height: 250px;
            margin-top: -125px;
            margin-left: -25%;
            @include noEvents();

            &.tall {
                height: 400px;
                margin-top: -200px;
            }
        }

        .chord-shape {
            &:nth-child(n+5) {
                margin-top: $spacing-small;
            }
        }
    }

    /* mobile view */

    @media screen and ( max-width: $mobile-width ) {
        .chord-overlay {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 0 $spacing-medium;
            @include boxSize();
        }

        .chord-shape {
            margin-right: $spacing-large;

            &:nth-child(n+4) {
                margin-top: $spacing-large;
            }
        }

        .close-button {
            display: block;
            position: absolute;
            top: $spacing-medium;
            right: $spacing-medium;
        }
    }
</style>
