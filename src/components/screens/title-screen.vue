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
    <div class="title">
        <div
            class="logo"
            :class="{ 'flipped': flipped }"
        >
            <img
                src="img/icons/android-chrome-512x512.png"
                class="flip"
                @click="close()"
            />
        </div>
    </div>
</template>

<script>
export default {
    data: () => ({
        flipped: false,
    }),
    mounted() {
        window.setTimeout(() => {
            this.flipped = true; // starts animation
            window.setTimeout(() => {
                this.close();
            }, 1500 );
        }, 2000 );
    },
    methods: {
        close() {
            this.$emit( "close" );
        },
    }
};
</script>

<style lang="scss" scoped>
.title {
    position: relative;
    position: block;
    width: 100%;
    height: 100%;
}

.logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &.flipped .flip {
       transform: rotateY( 360deg );
    }
}

.flip {
    position: relative;
    transition: 1.5s;
    transform-style: preserve-3d;
}
</style>
