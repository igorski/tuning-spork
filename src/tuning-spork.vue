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
    <div class="tuning-spork">
        <application-menu />
        <div class="tuning-spork__app">
            <!-- scale/configuration menu toggle (mobile only) -->
            <div class="tuning-spork__configuration-buttons">
                <button
                    type="button"
                    class="tuning-spork__configuration-toggle"
                    @click="setScaleSelectorOpened( !scaleSelectorOpened )"
                >Select scale</button>
                <button
                    type="button"
                    class="tuning-spork__configuration-toggle"
                    @click="setConfigurationOpened( !configurationOpened )"
                >Configure instrument</button>
            </div>
            <div class="tuning-spork__wrapper">
                <div class="tuning-spork__container">
                    <!-- scale configuration interface -->
                    <div class="tuning-spork__scale-selector">
                        <scale-selector
                            v-if="appMode === 0"
                            class="tuning-spork__aside"
                            :class="{ expanded: scaleSelectorOpened }"
                        >
                            <button
                                type="button"
                                class="close-button secondary"
                                @click="setScaleSelectorOpened( false )"
                            >&#x2715;</button>
                        </scale-selector>
                    </div>
                    <div class="tuning-spork__content">
                        <!-- instrument configuration -->
                        <div class="tuning-spork__configuration" :class="{ expanded: configurationOpened }">
                            <button
                                type="button"
                                class="close-button"
                                @click="setConfigurationOpened( false )"
                            >&#x2715;</button>
                            <instrument-selector @opened="setConfigurationOpened( $event )"/>
                        </div>
                        <!-- instrument fretboard -->
                        <fretboard />
                        <div class="tuning-spork__details">
                            <!-- compatible chords list -->
                            <chord-list v-if="appMode === 0"/>
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
                </div>
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
        InstrumentSelector: () => import( "@/components/instrument-selector" ),
        ScaleSelector,
    },
    data: () => ({
        foundChord: null,
        foundChordRoot: null,
        foundScales: [],
    }),
    computed: {
        ...mapState([
            "appMode",
            "chord",
            "configurationOpened",
            "notes",
            "scaleSelectorOpened",
            "tuning",
            "windowSize",
        ]),
    },
    watch: {
        chord() { this.calculateChord() },
        tuning() { this.calculateChord() },
    },
    created() {
        // no need to remove the below as we will require it throughout the application lifetime
        window.addEventListener( "resize", this.handleResize.bind( this ));
    },
    methods: {
        ...mapMutations([
            "setAppMode",
            "setKey",
            "setScale",
            "setConfigurationOpened",
            "setScaleSelectorOpened",
            "setWindowSize",
        ]),
        handleResize() {
            this.setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        },
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
                rootFret = this.chord[ rootString ];
            }
            if ( typeof rootFret !== "number" ) {
                return; // no notes found
            }
            let openStringNote = this.tuning.strings[ rootString ];
            let rootNoteIndex = this.notes.indexOf( openStringNote );
            let rootNote = this.notes[( rootNoteIndex + rootFret ) % this.notes.length ];
            rootNoteIndex = this.notes.indexOf( rootNote );

            // collect all intervals for every note

            let intervals = this.getIntervals( this.chord, rootNoteIndex );
            let chord = getChordByIntervals( intervals );

            if ( chord ) {
                this.foundChord = `${rootNote} ${chord}`;
            }
            // in case no chord was found but the amount of fretted notes exceeds that
            // of a triad, assume we are dealing with a slash chord (alternate note in bass)
            // try again with next higher string as assumed rootn ote
            else if ( this.chord.filter( fret => typeof fret === "number" ).length > 3 ) {
                const bassNote = rootNote;
                const bassIndex = rootString;

                openStringNote = null;
                rootFret = null;

                while ( !rootFret && --rootString > 0 ) {
                    openStringNote = this.tuning.strings[rootString];
                    rootFret = this.chord[rootString];
                }
                rootNoteIndex = this.notes.indexOf( openStringNote);
                rootNote = this.notes[( rootNoteIndex + rootFret ) % this.notes.length ];
                rootNoteIndex = this.notes.indexOf( rootNote );

                const filteredChord = this.chord.concat(); // remove slash note
                filteredChord[bassIndex] = undefined;

                intervals = this.getIntervals( filteredChord, rootNoteIndex );
                chord = getChordByIntervals( intervals );

                if ( chord ) {
                    this.foundChord = `${rootNote} ${chord}/${bassNote}`;
                }
            }
            if ( this.foundChord ) {
                this.foundChordRoot = rootNote;
                this.foundScales = getCompatibleScalesForIntervals( intervals, rootNote );
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
    }
};
</script>

<style lang="scss">
/* global styles */
@import "@/styles/global";
</style>

<style lang="scss" scoped>
/* scoped styles */
@import "@/styles/_variables";
@import "@/styles/_mixins";
@import "@/styles/_typography";

.tuning-spork {
    &__app {
        @include boxSize();
        padding-top: #{$menu-height};
        width: 100%;
        height: calc(100% - #{$footer-height});

        @include ideal() {
            padding-top: #{$menu-height + $app-ideal-top-margin};
        }
    }

    &__configuration-buttons {
        display: flex;
        margin: 0 $spacing-large $spacing-medium;

        @include large() {
            display: none;
        }
    }

    &__wrapper {
        // max-width: $app-width;
        height: 100%;
        margin: 0 auto;
    }

    &__container {
        flex: 1;

        @include large() {
            display: flex;
            justify-content: center;
            margin: 0 auto;
        }

        @include mobile() {
            padding: 0 $spacing-medium 0;
        }
    }

    &__content,
    &__aside {
        flex: 1;
    }

    &__content {
        @include scrollablePanel();
        max-width: $app-width;

        @include mobile() {
            @include scrollablePanel( 58px ); // 44px (button container) + $spacing-medium
        }
    }

    &__scale {
        @include button();
    }

    &__footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: $footer-height;
        width: 100%;

        @include mobile() {
            display: none;
        }
    }

    &__configuration {
        @include hiddenOnMobile();

        &-toggle {
            display: none; // mobile view only
        }

        @include mobile() {
            &-toggle {
                @include button();
                display: inline-block;
                margin: $spacing-medium auto 0;
            }
        }
    }

    &__details {
        @include large() {
            padding-left: $spacing-large;
        }
    }
}
</style>
