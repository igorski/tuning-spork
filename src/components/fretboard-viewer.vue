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
        <div class="fretboard">
            <string-viewer
                v-for="( note, index ) in tuning.strings"
                :key="`string_${index}`"
                :index="index"
                :note="note"
                :fret-amount="fretAmount"
                :start-fret="startFret"
            />
        </div>
        <div class="fretboard-view-options">
            <div class="fretboard-view-options__option">
                <label class="small">View</label>
                <model-select
                    :options="availableViewOptions"
                    v-model="selectedViewOption"
                    class="fretboard-view-options__option-select large"
                />
            </div>
            <div
                v-if="!isMobile"
                class="fretboard-view-options__option"
            >
                <label class="large">Amount of frets</label>
                <model-select
                    :options="availableFretAmounts"
                    v-model="selectedFretAmount"
                    class="fretboard-view-options__option-select small-list"
                />
            </div>
            <div class="fretboard-view-options__option">
                <label class="small">Start fret</label>
                <model-select
                    :options="availableStartFrets"
                    v-model="selectedStartFret"
                    class="fretboard-view-options__option-select small-list"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { mapSelectOptions } from "@/utils/select-util";
import StringViewer from "./string-viewer";

export default {
    components: {
        ModelSelect,
        StringViewer,
    },
    computed: {
        ...mapState([
            "fretAmount",
            "startFret",
            "tuning",
            "viewOption",
        ]),
        ...mapGetters([
            "isMobile",
        ]),
        availableViewOptions() {
            return [
                { value: "frets",   text: "Fret numbers" },
                { value: "notes",   text: "Note names" },
                { value: "degrees", text: "Scale degrees" }
            ];
        },
        selectedViewOption: {
            get() {
                return this.viewOption;
            },
            set( value ) {
                this.setViewOption( value );
            }
        },
        availableFretAmounts() {
            return mapSelectOptions([ 5, 7, 13, 24 ]);
        },
        selectedFretAmount: {
            get() {
                return this.fretAmount;
            },
            set( value ) {
                this.setFretAmount( value );
            }
        },
        availableStartFrets() {
            const frets = [];
            for ( let i = 0; i < Math.max( 13, this.fretAmount ); ++i ) {
                frets.push( i );
            }
            return mapSelectOptions( frets );
        },
        selectedStartFret: {
            get() {
                return this.startFret;
            },
            set( value ) {
                this.setStartFret( value );
            }
        },
    },
    watch: {
        isMobile: {
            immediate: true,
            handler( value ) {
                if ( value && this.fretAmount > 5 ) {
                    this.setFretAmount( 5 );
                }
            }
        },
    },
    methods: {
        ...mapMutations([
            "setViewOption",
            "setFretAmount",
            "setStartFret",
        ]),
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";
@import "@/styles/ui";

.fretboard {
    width: 100%;
    padding: $spacing-medium $spacing-medium 0 0;
    // background-color: $color-5;
    @include boxSize();
    @include noSelect();

    @include large() {
        padding-left: $spacing-medium;
    }

    &-view-options {
        margin-top: $spacing-medium;

        &__option {
            display: inline;
            margin-right: $spacing-medium;
            max-width: 240px;

            label {
                margin-right: $spacing-medium;
            }

            .small {
                width: 100px;
            }

            .large {
                max-width: 140px;
            }

            &-select {
                @include selectField();
            }
        }

        @include large() {
            padding-left: $spacing-large;
        }
    }
}
</style>
