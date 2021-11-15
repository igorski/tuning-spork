/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2021 Igor Zinken - https://www.igorski.nl
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
    <div class="tuning-spork">
        <application-menu />
        <div class="tuning-spork__app">
            <!-- configuration menu toggle (mobile only) -->
            <button
                type="button"
                class="tuning-spork__configuration-toggle"
                @click="setConfigurationOpened( !configurationOpened )"
            >Configure instrument</button>
            <!-- instrument and scale configuration -->
            <div class="tuning-spork__configuration" :class="{ expanded: configurationOpened }">
                <button
                    type="button"
                    class="close-button"
                    @click="setConfigurationOpened( false )"
                >&#x2715;</button>
                <instrument-selector @opened="setConfigurationOpened( $event )"/>
                <!-- scale configuration interface -->
                <template v-if="appMode === 0">
                    <scale-selector />
                </template>
            </div>
            <div class="tuning-spork__container">
                <!-- instrument fretboard -->
                <fretboard />
                <!-- compatible chords list -->
                <template v-if="appMode === 0">
                    <chord-list />
                </template>
                <template v-else>
                    <div v-if="!chord.length" class="explanation">
                        Found a sweet soundin' chord and curious what it is called ? Just fret the strings above
                        and we'll tell you what you are playing (and what scales go with it).
                    </div>
                    <div v-if="foundChord">
                        <h2>{{ foundChord }}</h2>
                    </div>
                    <div v-if="foundScales.length">
                        <p>The following scales are in key with this chord:</p>
                        <div
                            v-for="scale in foundScales"
                            class="tuning-spork__scale"
                            :key="scale"
                            @click="showScale(foundChordRoot, scale)"
                        >
                            {{ foundChordRoot }} {{ scale }}
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <footer class="tuning-spork__footer">
            <p>This trinket is <a href="https://www.github.com/igorski/tuning-spork" target="_blank">open source</a>. Contributions welcome!</p>
        </footer>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { getChordByIntervals } from "@/utils/chord-util";
import { getCompatibleScalesForIntervals } from "@/utils/interval-util";
import ApplicationMenu from "@/components/application-menu";
import ChordList from "@/components/chord-list";
import Fretboard from "@/components/fretboard";
import InstrumentSelector from "@/components/instrument-selector";
import ScaleSelector from "@/components/scale-selector";
import store from "@/store";

import "semantic-ui-css/components/dropdown.min.css"
import "vue-search-select/dist/VueSearchSelect.css";

export default {
    store,
    components: {
        ApplicationMenu,
        ChordList,
        Fretboard,
        InstrumentSelector,
        ScaleSelector,
    },
    data: () => ({
        foundChord: null,
        foundChordRoot: null,
        foundScales: [],
        configurationOpened: false,
    }),
    computed: {
        ...mapState([
            "appMode",
            "chord",
            "notes",
            "tuning",
        ]),
    },
    watch: {
        chord() { this.calculateChord() },
        tuning() { this.calculateChord() },
    },
    methods: {
        ...mapMutations([
            "setAppMode",
            "setKey",
            "setScale",
        ]),
        calculateChord() {
            // chord fingering changed, try to retrieve whether the chord fingering represents a known chord
            if ( this.appMode !== 1 ) {
                return;
            }
            this.foundChord = null;
            this.foundScales = [];

            // get the lowest fretted string to treat it as the root note (TODO: what about slash chords??)
            let rootString = this.chord.length;
            let rootFret;
            while ( typeof rootFret !== "number" && --rootString > 0 ) {
                rootFret = this.chord[rootString];
            }
            if ( typeof rootFret !== "number" ) {
                return; // no notes found
            }
            let openStringNote = this.tuning.strings[rootString];
            let rootNoteIndex = this.notes.indexOf(openStringNote);
            let rootNote = this.notes[(rootNoteIndex + rootFret) % this.notes.length];
            rootNoteIndex = this.notes.indexOf(rootNote);

            // collect all intervals for every note

            let intervals = this.getIntervals(this.chord, rootNoteIndex);
            let chord = getChordByIntervals(intervals);

            if ( chord ) {
                this.foundChord = `${rootNote} ${chord}`;
            }
            // in case no chord was found but the amount of fretted notes exceeds that
            // of a triad, assume we are dealing with a slash chord (alternate note in bass)
            // try again with next higher string as assumed rootn ote
            else if ( this.chord.filter( fret => typeof fret === "number" ).length > 3) {
                const bassNote = rootNote;
                const bassIndex = rootString;

                openStringNote = null;
                rootFret = null;

                while ( !rootFret && --rootString > 0 ) {
                    openStringNote = this.tuning.strings[rootString];
                    rootFret = this.chord[rootString];
                }
                rootNoteIndex = this.notes.indexOf(openStringNote);
                rootNote = this.notes[(rootNoteIndex + rootFret) % this.notes.length];
                rootNoteIndex = this.notes.indexOf(rootNote);

                const filteredChord = this.chord.concat(); // remove slash note
                filteredChord[bassIndex] = undefined;

                intervals = this.getIntervals(filteredChord, rootNoteIndex);
                chord = getChordByIntervals(intervals);

                if ( chord ) {
                    this.foundChord = `${rootNote} ${chord}/${bassNote}`;
                }
            }
            if ( this.foundChord ) {
                this.foundChordRoot = rootNote;
                this.foundScales = getCompatibleScalesForIntervals(intervals, rootNote);
            }
        },
        getIntervals( chord, rootNoteIndex ) {
            const intervals = [];
            let stringIndex = this.tuning.strings.length;
            while ( stringIndex-- ) {
                const stringFret = chord[ stringIndex ];
                if ( typeof stringFret !== "number" ) {
                    continue;
                }
                const openStringNote = this.tuning.strings[ stringIndex ];
                const stringNoteIndex = this.notes.indexOf( openStringNote );
                const frettedNote = this.notes[( stringNoteIndex + stringFret ) % this.notes.length ];

                let interval = this.notes.indexOf( frettedNote ) - rootNoteIndex;
                if ( interval < 0 ) {
                    interval += this.notes.length;
                }
                if ( !intervals.includes( interval )) {
                    intervals.push( interval );
                }
            }
            return intervals.sort(( a, b ) => a - b );
        },
        showScale( key, scale ) {
            this.setAppMode( 0 );
            this.setKey( key );
            this.setScale( scale );
        },
        setConfigurationOpened( opened ) {
            this.configurationOpened = opened;
        },
    }
};
</script>

<style lang="scss">
/* global styles */
@import "@/styles/layout";

.ui.search.selection.dropdown>input.search {
    @include boxSize(); // fixes issue in vue-search-select
}

.button {
    @include button();
}

.option {
    display: inline;
    margin-right: 12px;

    label {
        margin-right: 7px;
        font-weight: bold;
    }

    .root-note {
        color: $color-2;
    }

    @include mobile() {
        display: inline-flex;
        margin-bottom: $spacing-small;
        width: 100%;
        text-align: left;
        padding-left: $spacing-medium;
        @include boxSize();

        label {
            width: 30%;
            margin-top: $spacing-small;
        }
        .select {
            width: 70%;
        }
    }
}

.select {
    display: inline-block !important; // semantic-ui-css override

    &.small-list {
        max-width: 65px;
    }
    &.medium-list {
        max-width: 100px;
    }
    &.large-list {
        max-width: 200px;
    }
    .text {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: 100%;
    }
}

.explanation {
    @include ideal() {
        max-width: 600px;
        margin: $spacing-medium 0 $spacing-large;
    }
}
</style>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";
@import "@/styles/_typography";

/* scoped styles */

.tuning-spork {
    &__app {
        @include boxSize();
        $topPadding: #{$menu-height};
        padding-top: $topPadding;
        width: 100%;
        min-height: calc(100% - #{$topPadding});
    }

    &__container {
        max-width: $app-width;
        margin: 0 auto;
    }

    &__scale {
        @include button();
    }

    &__footer {
        height: $footer-height;
        width: 100%;
        text-align: center;
    }

    &__configuration {
        &-toggle,
        .close-button {
            display: none; // mobile view only
        }

        @include mobile() {
            display: none;
            &.expanded {
                @include overlay( $mobile-width, $mobile-width );
                margin-top: #{$menu-height + $spacing-large};
                display: block;

                .close-button {
                    display: block;
                    top: $spacing-large;
                    right: $spacing-large;
                }
            }

            &-toggle {
                @include button();
                display: inline-block;
                margin: $spacing-medium auto 0;
            }
        }
    }
}
</style>
