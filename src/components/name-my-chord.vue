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
     <div class="name-my-chord">
         <div v-if="!chord.length" class="explanation">
             <h2>Name my chord!</h2>
             Found a sweet soundin' chord and you're curious what it is called ? Just fret the strings above
             and we'll tell you what you are playing (and what scales go with it).
         </div>
         <div v-if="foundChord">
             <h2>{{ foundChord }}</h2>
         </div>
         <div v-if="scalesForRoot.scales.length">
             <p>The following scales (based on the chords root note) are in key with this chord:</p>
             <button
                 v-for="scaleName in scalesForRoot.scales"
                 :key="`${scalesForRoot.root}_${scaleName}`"
                 type="button"
                 class="name-my-chord__scale-button"
                 @click="showScale( scalesForRoot.root, scaleName )"
             >
                 {{ scalesForRoot.root }} {{ scaleName }}
             </button>
         </div>
         <div class="ui checkbox tuning-spork-checkbox name-my-chord__checkbox">
             <input
                 type="checkbox"
                 v-model="showAllScales"
                 id="showAllScales"
                 name="showAllScales"
             />
             <label for="showAllScales" class="tuning-spork-label">Show scales outside of root note keys</label>
         </div>
         <div v-if="showAllScales && scalesForAll.length">
             <p>The following scales are based on the other notes in the chord, and are also in key (be aware that these may clash with other chords in your chord progression, consider these "safe" for the current chord only):</p>
             <div
                 v-for="scale in scalesForAll"
                 :key="scale.root"
                 class="name-my-chord__scale-divider"
             >
                 <button
                     v-for="scaleName in scale.scales"
                     :key="`${scale.root}_${scaleName}`"
                     type="button"
                     class="name-my-chord__scale-button"
                     @click="showScale( scale.root, scaleName )"
                 >
                     {{ scale.root }} {{ scaleName }}
                 </button>
             </div>
         </div>
     </div>
 </template>

<script>
import { mapState, mapMutations } from "vuex";
import { getChordByIntervals } from "@/utils/chord-util";
import {
    getCompatibleScalesForIntervals, getCompatibleScalesForNotes, intervalsToNotes
} from "@/utils/interval-util";

export default {
    data: () => ({
        foundChord: null,
        scalesForRoot: { root: "C", scales: [] },
        scalesForAll: [],
        showAllScales: false
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
    created() {
        this.calculateChord();
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
                    openStringNote = this.tuning.strings[ rootString ];
                    rootFret = this.chord[ rootString ];
                }
                rootNoteIndex = this.notes.indexOf( openStringNote);
                rootNote = this.notes[( rootNoteIndex + rootFret ) % this.notes.length ];
                rootNoteIndex = this.notes.indexOf( rootNote );

                const filteredChord = this.chord.concat(); // remove slash note
                filteredChord[ bassIndex ] = undefined;

                intervals = this.getIntervals( filteredChord, rootNoteIndex );
                chord = getChordByIntervals( intervals );

                if ( chord ) {
                    this.foundChord = `${rootNote} ${chord}/${bassNote}`;
                }
            }

            if ( this.foundChord ) {
                // get all in-key scales for the root
                this.scalesForRoot.root   = rootNote;
                this.scalesForRoot.scales = getCompatibleScalesForIntervals( intervals );
                // also get the scales for other keys
                this.scalesForAll = getCompatibleScalesForNotes( intervalsToNotes( intervals, rootNote ), rootNote );
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

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";

.name-my-chord {
    &__scale-button {
        @include button();
    }

    &__scale-divider {
        margin-bottom: $spacing-medium;
    }

    &__checkbox {
        margin-top: $spacing-medium;
    }
}
</style>
