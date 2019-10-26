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
    <div class="chord-wrapper">
        <div class="fretboard">
            <div v-for="(note, stringIndex) in strings"
                 :key="`string_${stringIndex}`"
                 class="string"
                 :style="{ left: `${stringIndex / strings.length * 100}%` }"
            >
                <span class="note-name">{{ note }}</span>
                <div v-for="fret in visibleFretRange"
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
import { fretRange } from '@/utils/interval-util';

export default {
    props: {
        // the fretted notes in the rendered shape
        frettedNotes: {
            type: Array,
            required: true
        },
        // the starting fret position for which the shape was rendered
        firstFret: {
            type: Number,
            required: true,
        },
        firstString: {
            type: Number,
            default: 0,
        },
        visibleFrets: {
            type: Number,
            default: 4,
        }
    },
    computed: {
        ...mapState([
            'tuning',
        ]),
        strings() {
            return [...this.tuning.strings].reverse();
        },
        visibleFretRange() {
            return fretRange(this.firstFret, this.visibleFrets);
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '@/styles/_variables.scss';

    .chord-wrapper {
        display: inline-block;
        width: 120px;
        height: 80px;
        vertical-align: top;
        text-align: center;
    }

    .fretboard {
        position: relative;
        display: block;
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

    .note-name {
        position: absolute;
        top: -$spacing-large;
        font-weight: bold;
        font-size: 80%;
    }

    .fret-marker {
        display: block;
        width: 20px;
        height: 20px;
    }
</style>
