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
    <div class="string">
        <model-select
            v-if="editable"
            :options="formatOptions( notes )"
            v-model="tunedNote"
            class="string__tuning select"
        />
        <span v-else class="string__note-name">{{ tunedNote }}</span>
        <div
            class="string__wire"
            :style="{ height: `${index}px` }"
        >
            <div class="string__fret string__fret-first"></div>
            <!-- fret wire -->
            <div
                v-for="( fret, fretIndex ) in visibleFretRange"
                class="string__fret"
                :class="{ 'string__fret-nut': fret === 0 }"
                :key="`string ${index} fret ${fretIndex}`"
                :style="{ left: `${(fretIndex + 1 ) * 100 / fretAmount}%`}"
            ></div>
            <!-- app mode 0 : show scale notes -->
            <template v-if="appMode === 0">
                <div
                    v-for="fret in fretsInScale"
                    class="string__note"
                    :key="`string ${index} note ${fret}`"
                    :style="{ left: getNoteOffset( fret ), width: `${100 / fretAmount}%`}"
                    :class="{ root: getNoteByFret( fret ) === key, decimal: fret > 9 }"
                ><span class="string__note-icon">{{ getFretNode( fret ) }}</span></div>
            </template>
            <!-- app mode 1 : allow manual fretting of string -->
            <template v-else>
                <div
                    v-for="fret in visibleFretRange"
                    class="string__note string__note--selectable"
                    :key="`string ${index} note ${fret}`"
                    :class="{ hidden: fret !== activeFret }"
                    :style="{ left: getNoteOffset( fret ), width: `${100 / fretAmount}%`}"
                    @click="handleFretClick( fret )"
                >
                    <span class="string__note-icon">{{ fret }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { mapSelectOptions } from "@/utils/select-util";

export default {
    components: {
        ModelSelect,
    },
    props: {
        index: {
            type: Number,
            required: true
        },
        note: {
            type: String,
            required: true
        },
        fretAmount: {
            type: Number,
            default: 13, // full octave plus open string
        },
        startFret: {
            type: Number,
            default: 0, // open string/nut
        },
        editable: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        ...mapState([
            "chord",
            "appMode",
            "notes",
            "tuning",
            "key",
            "viewOption",
        ]),
        ...mapGetters([
            "availableScaleNotes",
        ]),
        tunedNote: {
            get() {
                return this.tuning.strings[ this.index ];
            },
            set( note ) {
                this.tuneString({ index: this.index, note });
            },
        },
        activeFret: {
            get() {
                return this.chord[ this.index ];
            },
            set( value ) {
                this.setChordStringFretIndex({ index: this.index, value });
            }
        },
        visibleFretRange() {
            const out = [];
            for ( let i = this.startFret, l = this.startFret + this.fretAmount; i < l; ++i ) {
                out.push( i );
            }
            return out;
        },
        fretsInScale() {
            return this.visibleFretRange.filter( fret => this.isNoteInScale( fret ));
        },
    },
    methods: {
        ...mapMutations([
            "tuneString",
            "setChordStringFretIndex"
        ]),
        isNoteInScale( fret ) {
            return this.availableScaleNotes.includes( this.getNoteByFret( fret ));
        },
        getNoteOffset( fret ) {
            return `${( fret - this.startFret ) * 100 / this.fretAmount}%`;
        },
        getNoteByFret( fret ) {
            const rootNoteIndex = this.notes.indexOf( this.note );
            return this.notes[( rootNoteIndex + fret ) % this.notes.length ];
        },
        formatOptions( items ) {
            return mapSelectOptions( items );
        },
        getFretNode( fret ) {
            switch ( this.viewOption ) {
                default:
                    return this.getNoteByFret( fret );
                case "frets":
                    return fret;
                case "degrees":
                    return this.availableScaleNotes.indexOf( this.getNoteByFret( fret )) + 1;
            }
        },
        handleFretClick( fret ) {
            this.activeFret = this.activeFret !== fret ? fret : undefined;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/layout";
$size: 40px;

.string {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    height: $size;

    &__tuning {
        max-width: 65px;
        margin-top: -10px;
    }

    &__note-name {
        @include bodyFont();
        color: $color-text;
        font-weight: bold;
        width: $spacing-large;
    }

    &__wire {
        position: relative;
        min-height: 1px;
        margin-top: 10px;
        width: 100%;
        background-color: $color-strings;
    }

    &__fret {
        position: absolute;
        width: 2px;
        height: $size;
        top: -($size / 2);
        background-color: grey;

        &-nut {
            width: 6px;
            background-color: #d6d6d6;
        }
    }

    &__note {
        $iconSize: $size / 2;
        position: absolute;
        top: -15px;
        height: $iconSize;

        &--selectable {
            cursor: pointer;
        }

        &-icon {
            position: absolute;
            width: $iconSize;
            left: 50%;
            margin-left: -( $iconSize / 2 );
            background-color: $color-3;
            border-radius: 50%;
            padding: 5px;
            font-weight: bold;
            color: $color-5;
            text-align: center;
        }

        &.root .string__note-icon {
            background-color: $color-2;
            color: $color-1;
        }

        &.hidden {
            opacity: 0;
        }
    }

    /* mobile view */

    @include mobile() {
        // (for now) these takes up too much space
        &__tuning,
        &__note-name {
           display: none !important;
        }
    }

    @include large() {
        &__fret-first {
            display: none;
        }
    }
}
</style>
