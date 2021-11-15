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
    <div class="scale-selector">
        <div class="option">
            <label>Key / <span class="root-note">root note</span></label>
            <model-select
                :options="availableNotes"
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
            <model-select
                :options="availableViewOptions"
                v-model="selectedViewOption"
                class="select medium-list"
            />
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { mapSelectOptions } from "@/utils/select-util";

export default {
    components: {
        ModelSelect,
    },
    computed: {
        ...mapState([
            "key",
            "notes",
            "scale",
            "scales",
            "viewOption",
        ]),
        availableNotes() {
            return mapSelectOptions( this.notes );
        },
        availableScales() {
            return mapSelectOptions( Object.keys( this.scales ).sort());
        },
        availableViewOptions() {
            return mapSelectOptions([ "frets", "notes", "degrees" ]);
        },
        selectedScale: {
            get() {
                return this.scale;
            },
            set( value ) {
                this.setScale( value );
            }
        },
        selectedKey: {
            get() {
                return this.key;
            },
            set( value ) {
                this.setKey( value );
            }
        },
        selectedViewOption: {
            get() {
                return this.viewOption;
            },
            set( value ) {
                this.setViewOption( value );
            }
        },
    },
    methods: {
        ...mapMutations([
            "setKey",
            "setScale",
            "setViewOption",
        ]),
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/_mixins";

.scale-selector {
    border-radius: $spacing-small;
    padding: $spacing-medium $spacing-large $spacing-large;
    text-align: left;
    @include boxSize();
    @include noSelect();

    @include ideal() {
        max-width: $app-width;
        margin: 0 auto;
        padding-left: 0;
    }
}
</style>
