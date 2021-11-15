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
    <div class="fretboard">
        <div
            v-for="( note, index ) in tuning.strings"
            :key="`string_${index}`"
        >
            <string
                :index="index"
                :note="note"
            />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import String from './string';

export default {
    components: {
        String
    },
    computed: {
        ...mapState([
            'tuning',
        ]),
    },
};
</script>

<style lang="scss">
@import "@/styles/_mixins";

.fretboard {
    width: 100%;
    padding: $spacing-large;
    border: 1px solid $color-2;
    background-color: $color-5;
    border-radius: $spacing-small;
    @include boxSize();
    @include noSelect();
}
</style>
