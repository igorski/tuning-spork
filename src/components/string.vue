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
    <div class="string-container">
        <select class="string-tuning"
                @change="handleTuningChange($event.target.value)">
            <option v-for="n in notes"
                    :key="`string_${index}_${n}`"
                    :selected="n === note"
            >{{ n }}</option>
        </select>
        <div class="string"
             :style="{ height: `${index}px` }"
        >
            <!-- fret wire -->
            <div v-for="fret in AMOUNT_OF_FRETS"
                 class="fret"
                 :key="`fret ${fret}`"
                 :style="{ left: `${(fret + 1 ) * 100 / AMOUNT_OF_FRETS.length}%`}"
            ></div>
            <!-- app mode 0 : show scale notes -->
            <template v-if="appMode === 0">
                <div v-for="fret in fretsInScale"
                     class="note"
                     :key="`string ${index} fret ${fret}`"
                     :style="{ left: `${fret * 100 / AMOUNT_OF_FRETS.length}%`}"
                     :class="{ root: getNoteByFret(fret) === key, decimal: fret > 9 }"
                ><span>{{ viewOption === 'frets' ? fret : getNoteByFret(fret) }}</span></div>
            </template>
            <!-- app mode 1 : allow manual fretting of string -->
            <template v-else>
                <div v-for="fret in AMOUNT_OF_FRETS"
                     class="note"
                     :key="`string ${index} fret ${fret}`"
                     :class="{ hidden: fret !== activeFret }"
                     :style="{ left: `${fret * 100 / AMOUNT_OF_FRETS.length}%`}"
                     @click="activeFret !== fret ? activeFret = fret : activeFret = undefined"
                 ><span>{{ fret }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

const AMOUNT_OF_FRETS = [];
// one octave is enough, yo
for (let i = 0; i < 13; ++i) {
    AMOUNT_OF_FRETS.push(i);
}

export default {
    props: {
        index: {
            type: Number,
            required: true
        },
        note: {
            type: String,
            required: true
        },
    },
    data: () => ({
        AMOUNT_OF_FRETS,
    }),
    computed: {
        ...mapState([
            'chord',
            'appMode',
            'notes',
            'tuning',
            'key',
            'viewOption',
        ]),
        ...mapGetters([
            'availableScaleNotes',
        ]),
        activeFret: {
            get() {
                return this.chord[this.index];
            },
            set(value) {
                this.setChordStringFretIndex({ index: this.index, value });
            }
        },
        fretsInScale() {
            return AMOUNT_OF_FRETS.filter(fret => this.isNoteInScale(fret));
        },
    },
    methods: {
        ...mapMutations([
            'tuneString',
            'setChordStringFretIndex'
        ]),
        isNoteInScale(fret) {
            return this.availableScaleNotes.includes(this.getNoteByFret(fret));
        },
        getNoteByFret(fret) {
            const rootNoteIndex = this.notes.indexOf(this.note);
            return this.notes[(rootNoteIndex + fret) % this.notes.length];
        },
        handleTuningChange(note) {
            this.tuneString({ index: this.index, note });
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '@/styles/layout.scss';
    $size: 40px;

    .string-container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        height: $size;
    }

    .string {
        position: relative;
        min-height: 1px;
        margin-top: 10px;
        width: 100%;
        background-color: #000;

        .fret {
            position: absolute;
            width: 2px;
            height: $size;
            top: -($size / 2);
            background-color: grey;

            // nut
            &:first-child {
                width: 6px;
                background-color: #d6d6d6;
            }
        }

        .note {
            position: absolute;
            top: -18px;
            width: $size / 2;
            height: $size / 2;
            margin-left: ($size / 2);
            background-color: $color-3;
            border-radius: 50%;
            padding: 5px;
            font-weight: bold;

            &.root {
                background-color: $color-2;
                color: $color-1;
            }

            span {
                position: absolute;
                left: 0;
                width: 100%;
            }

            &.hidden {
                opacity: 0;
            }
        }
    }
</style>
