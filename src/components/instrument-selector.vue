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
    <div class="instrument-selector">
        <h2 class="instrument-selector__title">{{ instrumentName }}</h2>
        <tuner v-if="tunerOpened" @close="tunerOpened = false" />
        <div class="option">
            <label>Instrument</label>
            <model-select
                :options="availableInstruments"
                v-model="selectedInstrumentType"
                class="select medium-list"
            />
        </div>
        <div v-if="availableStringAmountsForCurrentInstrument.length > 1" class="option">
            <label>Amount of strings</label>
            <model-select
                :options="availableStringAmounts"
                v-model="selectedStringAmount"
                class="select small-list"
            />
        </div>
        <div v-if="availableTunings.length > 1" class="option">
            <label>Tuning</label>
            <model-select
                :options="availableTunings"
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
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { initAudioContext } from "@/utils/audio-util";
import { mapSelectOptions } from "@/utils/select-util";

export default {
    components: {
        ModelSelect,
        Tuner: () => import( "@/components/tuner" ),
    },
    data: () => ({
        tunerOpened: false,
    }),
    computed: {
        ...mapState([
            "instrumentType",
            "tuning",
        ]),
        ...mapGetters([
            "availableStringAmountsForCurrentInstrument",
            "availableTuningsForCurrentStringAmount",
        ]),
        instrumentName() {
            return `${this.selectedStringAmount} string ${this.selectedInstrumentType} in ${this.selectedTuning} tuning`;
        },
        availableInstruments() {
            return mapSelectOptions([ "guitar", "bass", "ukelele" ]);
        },
        availableStringAmounts() {
            return mapSelectOptions( this.availableStringAmountsForCurrentInstrument );
        },
        availableTunings() {
            return mapSelectOptions( this.availableTuningsForCurrentStringAmount.map( t => t.name ));
        },
        selectedInstrumentType: {
            get() {
                return this.instrumentType;
            },
            set( value ) {
                this.setInstrumentType( value );
            }
        },
        selectedStringAmount: {
            get() {
                return this.tuning.strings.length;
            },
            set( value ) {
                this.setStandardTuningForStringAmount( value );
            }
        },
        selectedTuning: {
            get() {
                return this.tuning.name;
            },
            set( value ) {
                this.setTuning( this.availableTuningsForCurrentStringAmount.find(({ name }) => name === value ));
            }
        },
    },
    methods: {
        ...mapMutations([
            "setInstrumentType",
            "setStandardTuningForStringAmount",
            "setTuning",
        ]),
        openTuner() {
            initAudioContext();
            this.tunerOpened = true;
            this.$emit( "opened", false );
        }
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";

.instrument-selector {
    padding: $spacing-large;
    margin-bottom: $spacing-medium;
    border-bottom: 1px solid $color-5;
    background-color: $color-2;
    color: $color-5;
    @include boxSize();
    @include noSelect();

    &__title {
        margin-top: 0;
    }
}
</style>
