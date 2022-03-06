/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2022 Igor Zinken - https://www.igorski.nl
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
            @close="setSelectedChord(null)"
        />
        <h2>Available chords</h2>
        <fieldset class="chord-types">
            <div class="ui checkbox chord-type-checkbox">
                <input
                    type="checkbox"
                    v-model="powerChords"
                    id="powerChords"
                    name="powerChords"
                />
                <label for="powerChords" class="chord-type-label">Power chords</label>
            </div>
            <div class="ui checkbox chord-type-checkbox">
                <input
                    type="checkbox"
                    v-model="basicChords"
                    id="basicChords"
                    name="basicChords"
                />
                <label for="basicChords" class="chord-type-label">Basic chords</label>
            </div>
            <div class="ui checkbox chord-type-checkbox">
                <input
                    type="checkbox"
                    v-model="extendedChords"
                    id="extendedChords"
                    name="extendedChords"
                />
                <label for="extendedChords" class="chord-type-label">Extended chords</label>
            </div>
        </fieldset>
        <p class="explanation">
            These chords fit the chosen scale. You can use the above scale to improvise freely
            over a chord progression made of below chords.
            Hover over the chord to view recommended fingerings for your instrument and its tuning.
        </p>
        <div
            v-for="chordObject in filteredChords"
            :key="chordObject.name"
            class="chord-button"
            @touchstart="setSelectedChord (chordObject )"
            @mouseover="setSelectedChord( chordObject )"
            @mouseout="setSelectedChord( null )"
        >
            {{ chordObject.name }}
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { isPowerChord } from "@/utils/chord-util";
import ChordOverlay from "./chord-overlay";

import "semantic-ui-css/components/checkbox.min.css";

export default {
    components: {
        ChordOverlay,
    },
    data: () => ({
        selectedChord: null,
    }),
    computed: {
        ...mapState([
            "chordOptions",
            "tuning",
        ]),
        ...mapGetters([
            "availableScaleChords",
        ]),
        powerChords: {
            get() {
                return this.chordOptions.power;
            },
            set( value ) {
                this.setChordOption({ option: "power", value });
            },
        },
        basicChords: {
            get() {
                return this.chordOptions.basic;
            },
            set( value ) {
                this.setChordOption({ option: "basic", value });
            }
        },
        extendedChords: {
            get() {
                return this.chordOptions.extended;
            },
            set( value ) {
                this.setChordOption({ option: "extended", value });
            }
        },
        filteredChords() {
            return this.availableScaleChords.filter( chord => {
                if ( this.powerChords && isPowerChord( chord )) {
                    return chord;
                }
                if ( this.basicChords && chord.notes.length === 3 ) {
                    return chord;
                }
                if ( this.extendedChords && chord.notes.length > 3 ) {
                    return chord;
                }
                return null;

            }).filter( chord => chord.notes.length <= this.tuning.strings.length );
        },
    },
    methods: {
        ...mapMutations([
            "setChordOption",
        ]),
        setSelectedChord( chord = null ) {
            this.selectedChord = chord;
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";
@import "@/styles/_variables";

.chord-types {
    border: none;
    padding: 0 0 $spacing-small;
    margin: 0;
}

.chord-type-checkbox {
    margin-right: $spacing-medium;
}

.chord-type-label {
    cursor: pointer;
    color: $color-text !important;
}

.chord-button {
    @include button();
}
</style>
