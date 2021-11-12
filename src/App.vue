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
        <tuner v-if="tunerOpened" @close="tunerOpened = false" />
        <div class="app">
            <!-- configuration menu toggle (mobile only) -->
            <button
                type="button"
                class="configuration-toggle"
                @click="setConfigurationOpened(!configurationOpened)"
            >Configure instrument</button>
            <!-- instrument and scale configuration -->
            <div class="configuration" :class="{ expanded: configurationOpened }">
                <button
                    type="button"
                    class="close-button"
                    @click="setConfigurationOpened( false )"
                >&#x2715;</button>
                <div class="interface">
                    <div class="option">
                        <label>Instrument</label>
                        <model-select :options="formatOptions(['guitar', 'bass', 'ukelele'])"
                                      v-model="selectedInstrumentType"
                                      class="select medium-list"
                        />
                    </div>
                    <div v-if="availableStringAmountsForCurrentInstrument.length > 1" class="option">
                        <label>Amount of strings</label>
                        <model-select :options="formatOptions(availableStringAmountsForCurrentInstrument)"
                                      v-model="selectedStringAmount"
                                      class="select small-list"
                        />
                    </div>
                    <div v-if="availableTunings.length > 1" class="option">
                        <label>Tuning</label>
                        <model-select :options="availableTunings"
                                      v-model="selectedTuning"
                                      class="select large-list"
                        />
                    </div>
                    <button
                        type="button"
                        class="button"
                        @click="openTuner()"
                    >Tuner</button>
                </div>
                <!-- scale configuration interface -->
                <template v-if="appMode === 0">
                    <div class="interface">
                        <div class="option">
                            <label>Key / <span class="root-note">root note</span></label>
                            <model-select :options="availableNotes"
                                          v-model="selectedKey"
                                          class="select small-list"
                            />
                        </div>
                        <div class="option">
                            <label>Scale</label>
                            <model-select
                                :options="availableScales"
                                v-model="selectedScale"
                                placeholder="Find scale by name"
                                class="select large-list"
                            />
                        </div>
                        <div class="option">
                            <label>View</label>
                            <model-select :options="availableViewOptions"
                                          v-model="selectedViewOption"
                                          class="select medium-list"
                            />
                        </div>
                    </div>
                </template>
            </div>
            <!-- instrument fretboard -->
            <fretboard />
            <!-- compatible chords list -->
            <template v-if="appMode === 0">
                <chord-list />
            </template>
            <template v-else>
                <div v-if="!chord.length">
                    Found a sweet soundin' chord and curious what it is called ? Just fret the strings above
                    and we'll tell you what you are playing (and what scales go with it).
                </div>
                <div v-if="foundChord">
                    <h2>{{ foundChord }}</h2>
                </div>
                <div v-if="foundScales.length">
                    <p>The following scales are in key with this chord:</p>
                    <div v-for="scale in foundScales"
                         class="scale"
                         :key="scale"
                         @click="showScale(foundChordRoot, scale)"
                    >
                        {{ foundChordRoot }} {{ scale }}
                    </div>
                </div>
            </template>
        </div>
        <footer class="footer">
            <p>This trinket is <a href="https://www.github.com/igorski/tuning-spork" target="_blank">open source</a>. Contributions welcome!</p>
        </footer>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { getChordByIntervals } from "@/utils/chord-util";
import { getCompatibleScalesForIntervals } from "@/utils/interval-util";
import { mapSelectOptions } from "@/utils/select-util";
import ApplicationMenu from "@/components/application-menu";
import Fretboard from "@/components/fretboard";
import ChordList from "@/components/chord-list";
import { initAudioContext } from "@/utils/audio-util";
import store from "@/store";

import "semantic-ui-css/components/dropdown.min.css"
import "vue-search-select/dist/VueSearchSelect.css";

export default {
    store,
    components: {
        ApplicationMenu,
        ModelSelect,
        Fretboard,
        ChordList,
        Tuner: () => import( "@/components/tuner" )
    },
    data: () => ({
        foundChord: null,
        foundChordRoot: null,
        foundScales: [],
        configurationOpened: false,
        tunerOpened: false,
    }),
    computed: {
        ...mapState([
            "appMode",
            "chord",
            "notes",
            "scales",
            "instrumentType",
            "tuning",
            "key",
            "scale",
            "viewOption",
        ]),
        ...mapGetters([
            "availableStringAmountsForCurrentInstrument",
            "availableTuningsForCurrentStringAmount",
        ]),
        selectedInstrumentType: {
            get() { return this.instrumentType; },
            set(value) { this.setInstrumentType(value); }
        },
        selectedStringAmount: {
            get() { return this.tuning.strings.length; },
            set(value) { this.setStandardTuningForStringAmount(value); }
        },
        selectedTuning: {
            get() { return this.tuning.name; },
            set(value) { this.setTuning(this.availableTuningsForCurrentStringAmount.find(t => t.name === value)); }
        },
        selectedScale: {
            get() { return this.scale; },
            set(value) { this.setScale(value); }
        },
        selectedKey: {
            get() { return this.key; },
            set(value) { this.setKey(value); }
        },
        selectedViewOption: {
            get() { return this.viewOption; },
            set(value) { this.setViewOption(value); }
        },
        availableNotes() {
            return this.formatOptions(this.notes);
        },
        availableTunings() {
            return this.formatOptions(this.availableTuningsForCurrentStringAmount.map(t => t.name));
        },
        availableScales() {
            return this.formatOptions(Object.keys(this.scales).sort());
        },
        availableViewOptions() {
            return this.formatOptions(["frets", "notes", "degrees"]);
        }
    },
    watch: {
        chord() { this.calculateChord() },
        tuning() { this.calculateChord() },
    },
    methods: {
        ...mapMutations([
            "setAppMode",
            "setInstrumentType",
            "setKey",
            "setScale",
            "setTuning",
            "setStandardTuningForStringAmount",
            "setViewOption",
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
            while (typeof rootFret !== "number" && --rootString > 0) {
                rootFret = this.chord[rootString];
            }
            if (typeof rootFret !== "number") {
                return; // no notes found
            }
            let openStringNote = this.tuning.strings[rootString];
            let rootNoteIndex = this.notes.indexOf(openStringNote);
            let rootNote = this.notes[(rootNoteIndex + rootFret) % this.notes.length];
            rootNoteIndex = this.notes.indexOf(rootNote);

            // collect all intervals for every note

            let intervals = this.getIntervals(this.chord, rootNoteIndex);
            let chord = getChordByIntervals(intervals);

            if (chord) {
                this.foundChord = `${rootNote} ${chord}`;
            }
            // in case no chord was found but the amount of fretted notes exceeds that
            // of a triad, assume we are dealing with a slash chord (alternate note in bass)
            // try again with next higher string as assumed rootn ote
            else if (this.chord.filter(fret => typeof fret === "number").length > 3) {
                const bassNote = rootNote;
                const bassIndex = rootString;

                openStringNote = null;
                rootFret = null;
                while (!rootFret && --rootString > 0) {
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

                if (chord) {
                    this.foundChord = `${rootNote} ${chord}/${bassNote}`;
                }
            }
            if (this.foundChord) {
                this.foundChordRoot = rootNote;
                this.foundScales = getCompatibleScalesForIntervals(intervals, rootNote);
            }
        },
        getIntervals( chord, rootNoteIndex ) {
            const intervals = [];
            let stringIndex = this.selectedStringAmount;
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
        formatOptions( items ) {
            return mapSelectOptions( items );
        },
        setConfigurationOpened( opened ) {
            this.configurationOpened = opened;
        },
        openTuner() {
            initAudioContext();
            this.configurationOpened = false;
            this.tunerOpened = true;
        }
    }
};
</script>

<style lang="scss">
@import "@/styles/layout";

$footerHeight: 55px;

.app {
    margin: $menu-height auto 0;
    max-width: $app-width;
    padding-bottom: $footerHeight;
}

.button {
    @include button();
}

.configuration-toggle,
.configuration .close-button {
    display: none; // mobile view only
}

.interface {
    padding: $spacing-medium 0 0;
    @include boxSize();
    @include noSelect();
}

.option {
    display: inline;
    margin-right: 12px;

    label {
        margin-right: 7px;
    }

    .root-note {
        color: $color-2;
    }
}

.scale {
    cursor: pointer;
    display: inline-block;
    padding: 10px;
    border-radius: 7px;
    border: 2px solid #999;
    margin: 0 7px 7px;
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

.footer {
    height: $footerHeight;
    width: 100%;

    @include large() {
        position: fixed;
        bottom: 0;
        background-color: $color-1;
    }
}

/* mobile view */

@include mobile() {
    .configuration-toggle {
        display: inline-block;
        margin: $spacing-medium auto 0;
        @include largeButton();
    }

    .configuration {
        display: none;

        &.expanded {
            @include overlay( $mobile-width, $mobile-width );
            display: block;

            .close-button {
                display: block;
            }
        }
    }
    .option {
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
</style>
