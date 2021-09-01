/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Igor Zinken - https://www.igorski.nl
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
        <template v-if="hasMultipleStringOptions">
            <h2>How many strings?</h2>
            <ul>
                <li
                    v-for="(strings, index) in availableStringAmountsForCurrentInstrument"
                    :key="`string_select_${index}`"
                >
                    <button
                        type="button"
                        @click="selectedStringAmount = strings"
                    >{{ strings }}</button>
                </li>
            </ul>
        </template>
        <div v-if="availableTunings.length > 1" class="option">
            <label>Tuning</label>
            <model-select
                :options="availableTunings"
                v-model="selectedTuning"
                class="select small-list"
            />
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
    data: () => ({
        page: 0,
    }),
    computed: {
        ...mapState([
            "tuning",
        ]),
        ...mapGetters([
            "availableStringAmountsForCurrentInstrument",
            "availableTuningsForCurrentStringAmount",
        ]),
        availableTunings() {
            return mapSelectOptions( this.availableTuningsForCurrentStringAmount.map( t => t.name ));
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
    created() {
        this.hasMultipleStringOptions = this.availableStringAmountsForCurrentInstrument.length > 1;
    },
    methods: {
        ...mapMutations([
            "setStandardTuningForStringAmount",
            "setTuning",
        ]),
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/layout.scss";
</style>
