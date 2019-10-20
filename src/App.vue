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
    <div id="app">
        <h1>guitar scale visualiser</h1>
        <div class="mode-switcher">
            <button :class="{ 'active': appMode === 0 }" type="button" @click="setAppMode(0)">Scale generator</button>
            <button :class="{ 'active': appMode === 1 }" type="button" @click="setAppMode(1)">Name my chord!</button>
        </div>
        <!-- instrument interface -->
        <div class="interface">
            <div class="option">
                <label for="instrumentType">Instrument</label>
                <select id="instrumentType"
                        v-model="selectedInstrumentType"
                >
                    <option v-for="type in ['guitar', 'bass', 'ukelele']"
                            :key="`${type}_instrument`"
                            :value="type"
                    >{{ type }}</option>
                </select>
            </div>
            <div class="option">
                <label for="stringAmount">Amount of strings</label>
                <select id="stringAmount"
                        v-model.number="selectedStringAmount"
                >
                    <option v-for="amount in availableStringAmountsForCurrentInstrument"
                            :key="`${amount}_strings`"
                            :value="amount"
                    >{{ amount }}</option>
                </select>
            </div>
            <div class="option">
                <label for="tuning">Tuning</label>
                <select id="tuning"
                        v-model="selectedTuning"
                >
                    <option v-for="tun in availableTuningsForCurrentStringAmount"
                            :key="`${tun.name}_tuning`"
                            :value="tun"
                    >{{ tun.name }}</option>
                </select>
            </div>
        </div>
        <!-- instrument fretboard -->
        <fretboard />
        <template v-if="appMode === 0">
            <!-- scale interface -->
            <div class="interface">
                <div class="option">
                    <label>Key / <span class="root-note">root note</span></label>
                    <select id="rootNote"
                            @change="changeKey($event.target.value)"
                    >
                        <option v-for="note in notes"
                                :key="`note ${note}`"
                                :selected="note === key"
                        >{{ note }}</option>
                    </select>
                </div>
                <div class="option">
                    <label>Scale</label>
                    <select id="scale"
                            @change="changeScale($event.target.value)"
                    >
                        <option v-for="scaleName in Object.keys(scales)"
                                :key="`${scaleName} scale`"
                                :selected="scaleName === scale"
                        >{{ scaleName }}</option>
                    </select>
                </div>
                <div class="option">
                    <label>View</label>
                    <select id="viewOption"
                            @change="setViewOption($event.target.value)"
                    >
                        <option v-for="option in ['frets', 'notes']"
                                :key="option"
                                :selected="viewOption === option"
                        >{{ option }}</option>
                    </select>
                </div>
            </div>
            <!-- chord list -->
            <chord-list />
        </template>
        <template v-else>
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
        <p>This trinket is <a href="https://www.github.com/igorski/guitar-scale-visualiser" target="_blank">open source</a>. Go make it better.</p>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import Fretboard from '@/components/fretboard';
import ChordList from '@/components/chord-list';
import { getChordByIntervals } from '@/utils/chord-util';
import { getCompatibleScalesForIntervals } from '@/utils/interval-util';
import store from '@/store';

export default {
    name: 'guitar-scale-visualiser',
    store,
    components: {
        Fretboard,
        ChordList
    },
    data: () => ({
        foundChord: null,
        foundChordRoot: null,
        foundScales: [],
    }),
    computed: {
        ...mapState([
            'appMode',
            'chord',
            'notes',
            'scales',
            'instrumentType',
            'tuning',
            'key',
            'scale',
            'viewOption',
        ]),
        ...mapGetters([
            'availableStringAmountsForCurrentInstrument',
            'availableTuningsForCurrentStringAmount',
        ]),
        selectedInstrumentType: {
            get() {
                return this.instrumentType;
            },
            set(value) {
                this.setInstrumentType(value);
            },
        },
        selectedStringAmount: {
            get() {
                return this.tuning.strings.length;
            },
            set(value) {
                this.setStandardTuningForStringAmount(value);
            },
        },
        selectedTuning: {
            get() {
                return this.tuning;
            },
            set(value) {
                this.setTuning(value);
            }
        },
    },
    watch: {
        chord() { this.calculateChord() },
        tuning() { this.calculateChord() },
    },
    methods: {
        ...mapMutations([
            'setAppMode',
            'setInstrumentType',
            'setKey',
            'setScale',
            'setTuning',
            'setStandardTuningForStringAmount',
            'setViewOption',
        ]),
        changeKey(note) {
            this.setKey(note);
        },
        changeScale(scale) {
            this.setScale(scale);
        },
        calculateChord() {
            // chord fingering changed, try to retrieve whether the chord fingering represents a known chord
            if (this.appMode !== 1 ) {
                return;
            }

            this.foundChord = null;
            this.foundScales = [];

            // get the lowest fretted string to treat it as the root note (TODO: what about slash chords??)
            let rootString = this.chord.length;
            let rootFret;
            while (typeof rootFret !== 'number' && --rootString > 0) {
                rootFret = this.chord[rootString];
            }
            if (typeof rootFret !== 'number') {
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
            else if (this.chord.filter(fret => typeof fret === 'number').length > 3) {
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
        getIntervals(chord, rootNoteIndex) {
            const intervals = [];
            let stringIndex = this.selectedStringAmount;
            while (stringIndex--) {
                const stringFret = chord[stringIndex];
                if (typeof stringFret !== 'number') {
                    continue;
                }
                const openStringNote = this.tuning.strings[stringIndex];
                const stringNoteIndex = this.notes.indexOf(openStringNote);
                const frettedNote = this.notes[(stringNoteIndex + stringFret) % this.notes.length];

                let interval = this.notes.indexOf(frettedNote) - rootNoteIndex;
                if (interval < 0) {
                    interval += this.notes.length;
                }
                if (!intervals.includes(interval)) {
                    intervals.push(interval);
                }
            }
            return intervals.sort((a, b) => a - b);
        },
        showScale(key, scale) {
            this.setAppMode(0);
            this.setKey(key);
            this.setScale(scale);
        }
    }
};
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin: 20px auto 0;
        max-width: 960px;
    }

    .mode-switcher {
        margin: 0 0 20px;

        button {
            cursor: pointer;
            display: inline-block;
            margin: 0 5px;
            padding: 5px 10px;
            border: 1px solid #000;
            background-color: #FFF;

            &.active {
                background-color: cornflowerblue;
                color: #FFF;
             }
        }
    }

    .interface {
        padding: 0;
    }

    .option {
        display: inline;
        margin-right: 12px;

        label {
            margin-right: 7px;
        }

        .root-note {
            color: red;
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
</style>
