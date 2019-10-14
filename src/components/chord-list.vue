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
    <div>
        <chord-overlay
            v-if="selectedChord !== null"
            :chord="selectedChord"
        />
        <h2>Available chords</h2>
        <p>
            These chords fit the chosen scale. You can use the above scale to improvise freely
            over a chord progression made of below chords.
            Hover over the chord to view recommended fingerings for your instrument and its tuning.
        </p>
        <div v-for="chordObject in availableScaleChords"
             :key="chordObject.name"
             class="chord"
             @mouseover="selectedChord = chordObject"
             @mouseout="selectedChord = null"
        >
            {{ chordObject.name }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ChordOverlay from './chord-overlay';

export default {
    components: {
        ChordOverlay,
    },
    data: () => ({
        selectedChord: null,
    }),
    computed: {
        ...mapGetters([
            'availableScaleChords',
        ]),
    },
};
</script>

<style lang="scss" scoped>
    .chord {
        cursor: pointer;
        display: inline-block;
        padding: 10px;
        border-radius: 7px;
        border: 2px solid #999;
        margin: 0 7px 7px;
    }
</style>
