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
        <fieldset>
            <div class="ui checkbox">
                <input type="checkbox"
                       v-model="powerChords"
                       id="powerChords"
                       name="powerChords"
                />
                <label for="powerChords">Power chords</label>
            </div>
            <div class="ui checkbox">
                <input type="checkbox"
                       v-model="basicChords"
                       id="basicChords"
                       name="basicChords"
                />
                <label for="basicChords">Basic chords</label>
            </div>
            <div class="ui checkbox">
                <input type="checkbox"
                       v-model="extendedChords"
                       id="extendedChords"
                       name="extendedChords"
                />
                <label for="extendedChords">Extended chords</label>
            </div>
        </fieldset>
        <p>
            These chords fit the chosen scale. You can use the above scale to improvise freely
            over a chord progression made of below chords.
            Hover over the chord to view recommended fingerings for your instrument and its tuning.
        </p>
        <div v-for="chordObject in filteredChords"
             :key="chordObject.name"
             class="chord button"
             @mouseover="selectedChord = chordObject"
             @mouseout="selectedChord = null"
        >
            {{ chordObject.name }}
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { isPowerChord } from '@/utils/chord-util';
import ChordOverlay from './chord-overlay';

import 'semantic-ui-css/components/checkbox.min.css'

export default {
    components: {
        ChordOverlay,
    },
    data: () => ({
        selectedChord: null,
    }),
    computed: {
        ...mapState([
            'chordOptions',
            'tuning',
        ]),
        ...mapGetters([
            'availableScaleChords',
        ]),
        powerChords: {
            get() {
                return this.chordOptions.power;
            },
            set(value) {
                this.setChordOption({ option: 'power', value });
            },
        },
        basicChords: {
            get() {
                return this.chordOptions.basic;
            },
            set(value) {
                this.setChordOption({ option: 'basic', value });
            }
        },
        extendedChords: {
            get() {
                return this.chordOptions.extended;
            },
            set(value) {
                this.setChordOption({ option: 'extended', value });
            }
        },
        filteredChords() {
            return this.availableScaleChords.filter(chord => {
                if (this.powerChords && isPowerChord(chord)) {
                    return chord;
                }
                if (this.basicChords && chord.notes.length === 3) {
                    return chord;
                }
                if (this.extendedChords && chord.notes.length > 3) {
                    return chord;
                }
                return null;

            }).filter(chord => chord.notes.length <= this.tuning.strings.length);
        },
    },
    methods: {
        ...mapMutations([
            'setChordOption',
        ]),
    }
};
</script>

<style lang="scss" scoped>
    @import '@/styles/_variables.scss';

    fieldset {
        border: none;
    }

    .checkbox {
        margin-right: $spacing-medium;
    }

    .chord {
        display: inline-block;
        cursor: pointer;
        border-radius: $spacing-large;
        padding: $spacing-small ($spacing-small * 1.5);
        background-color: $color-2;
        border: 2px solid $color-4;
        color: $color-1;
        font-size: 90%;
        font-weight: bold;
        margin: 0 $spacing-small $spacing-small 0;

        &:hover {
            background-color: $color-1;
            color: $color-4;
        }
    }
</style>
