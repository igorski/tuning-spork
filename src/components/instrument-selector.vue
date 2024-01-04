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
    <div
        class="instrument-selector"
        :class="{ 'instrument-selector--collapsed': collapsed }"
    >
        <button
            type="button"
            class="instrument-selector__collapse-button"
            @click="collapsed = !collapsed"
        >{{ collapsed ? 'expand' : 'collapse' }}</button>
        <button
            type="button"
            class="instrument-selector__close-button"
            @click="setConfigurationOpened( false )"
        >&#x2715;</button>
        <tuner-window v-if="tunerOpened" @close="tunerOpened = false" />
        <template v-if="!collapsed">
            <h2 class="instrument-selector__title">{{ instrumentName }}</h2>
            <div class="instrument-selector__option">
                <label>Instrument</label>
                <model-select
                    :options="availableInstruments"
                    v-model="selectedInstrumentType"
                    class="instrument-selector__select medium-list"
                />
            </div>
            <div v-if="availableStringAmountsForCurrentInstrument.length > 1" class="instrument-selector__option">
                <label>Amount of strings</label>
                <model-select
                    :options="availableStringAmounts"
                    v-model="selectedStringAmount"
                    class="instrument-selector__select small-list"
                />
            </div>
            <div v-if="availableTunings.length > 1" class="instrument-selector__option">
                <label>Tuning</label>
                <model-select
                    :options="availableTunings"
                    v-model="selectedTuning"
                    class="instrument-selector__select large-list"
                />
            </div>
            <button
                v-tooltip="'Instrument tuner'"
                type="button"
                class="instrument-selector__tuner-button"
                @click="openTuner()"
            >
                <img src="@/assets/icons/tuning-fork.svg" />
            </button>
        </template>
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
        TunerWindow: () => import( "@/components/tuner-window.vue" ),
    },
    data: () => ({
        tunerOpened: false,
        collapsed: false
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
            "setConfigurationOpened",
            "setInstrumentType",
            "setStandardTuningForStringAmount",
            "setTuning",
        ]),
        openTuner() {
            initAudioContext();
            this.tunerOpened = true;
        }
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";
@import "@/styles/ui";

.instrument-selector {
    position: relative;
    padding: $spacing-large;
    border-bottom: 1px solid $color-5;
    background-color: $color-2;
    color: $color-5;
    @include boxSize();
    @include noSelect();

    @include large() {
        margin: 0 $spacing-medium $spacing-medium 0;
    }

    &--collapsed {
        overflow: hidden;
    }

    &__collapse-button {
        @include roundButton();
        position: absolute;
        top: $spacing-medium;
        right: $spacing-medium;

        @include mobile() {
            display: none;
        }
    }

    &__close-button {
        @include closeButton();
        color: #000;

        @include large() {
            display: none;
        }
    }

    &__title {
        margin-top: 0;
    }

    &__option {
        @include formField();
    }

    &__select {
        @include selectField();
        margin-right: $spacing-medium;
    }

    &__tuner-button {
        cursor: pointer;
        border-radius: 50%;
        padding: 0 2px;
        background: none;
        border: 3px solid $color-1;
        vertical-align: bottom;

        @include large() {
            position: absolute;
            right: #{$spacing-large - $spacing-small};
        }

        &:hover {
            background-color: $color-3;
        }

        img {
            width: 30px;
            height: 30px;
        }
    }
}
</style>
