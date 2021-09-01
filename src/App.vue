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
    <div class="tuning-spork">
        <application-menu />
        <div class="app">
            <transition-group name="slide">
                <title-screen
                    v-if="screen === 0"
                    @close="setScreen( 1 )"
                    key="screen1"
                />
                <instrument-select-screen
                    v-if="screen === 1"
                    @close="setScreen( 2 )"
                    key="screen2"
                />
                <tuning-select-screen
                    v-if="screen === 2"
                    @close="setScreen( 3 )"
                    key="screen3"
                />
                <main-screen
                    v-if="screen === 3"
                    key="screen4"
                />
            </transition-group>
            <div>
                <button
                    type="button"
                    :disabled="screen < 2"
                    @click="setScreen( screen - 1 )"
                >Previous</button>
                <button
                    type="button"
                    :disabled="screen === 3"
                    @click="setScreen( screen + 1 )"
                >Next</button>
            </div>
        </div>
        <footer class="footer">
            <p>This trinket is <a href="https://www.github.com/igorski/tuning-spork" target="_blank">open source</a>. Contributions welcome!</p>
        </footer>
    </div>
</template>

<script>
import ApplicationMenu from "@/components/application-menu";
import InstrumentSelectScreen from "@/components/screens/instrument-select-screen";
import MainScreen from "@/components/screens/main-screen";
import TitleScreen from "@/components/screens/title-screen";
import TuningSelectScreen from "@/components/screens/tuning-select-screen";
import store from "@/store";

import "semantic-ui-css/components/dropdown.min.css"
import "vue-search-select/dist/VueSearchSelect.css";

export default {
    store,
    components: {
        ApplicationMenu,
        InstrumentSelectScreen,
        MainScreen,
        TitleScreen,
        TuningSelectScreen,
    },
    data: () => ({
        screen: 0,
    }),
    methods: {
        setScreen( num ) {
            this.screen = num;
        },
    },
};
</script>

<style lang="scss">
@import "@/styles/layout";
@import "@/styles/animations";

$footerHeight: 55px;

.app {
    margin: $menu-height auto 0;
    max-width: $app-width;
    padding-bottom: $footerHeight;
}

.footer {
    height: $footerHeight;
    width: 100%;

    @include large() {
        position: fixed;
        bottom: 0;
        background-color: $color-1;
    }
}
</style>
