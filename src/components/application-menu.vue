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
    <header class="header" :class="{ expanded: menuOpened }">
        <nav class="header__menu">
            <div class="header__menu-toggle" @click="setMenuOpened(!menuOpened)">
                <span>&#9776;</span>
            </div>
            <div class="header__menu-list">
                <h1 class="header__title">Tuning spork!</h1>
                <button
                    type="button"
                    class="menu-button"
                    :class="{ 'menu-button--active': appMode === 0 }"
                    @click="scaleGeneratorClick()"
                >Scale generator</button>
                <button
                    type="button"
                    class="menu-button"
                    :class="{ 'menu-button--active': appMode === 1 }"
                    @click="nameMyChordClick()"
                >Name my chord!</button>
            </div>
        </nav>
    </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
    data: () => ({
        menuOpened: false,
    }),
    computed: {
        ...mapState([
            'appMode',
        ]),
    },
    methods: {
        ...mapMutations([
            'setAppMode',
        ]),
        setMenuOpened(opened) {
            this.menuOpened = opened;
        },
        scaleGeneratorClick() {
            this.setAppMode(0);
            this.setMenuOpened(false);
        },
        nameMyChordClick() {
            this.setAppMode(1);
            this.setMenuOpened(false);
        },
    }
};
</script>

<style lang="scss" scoped>
@import "@/styles/layout";

.header {
    width: 100%;
    height: $menu-height;
    position: fixed;
    background-color: $color-5;
    top: 0;
    left: 0;
    z-index: $z-index-header;

    &__title {
        display: inline;
        color: #FFF;
        margin: 0 $spacing-medium 0 $spacing-small;

        @include mobile() {
            display: none;
        }
    }
}

.header__menu {
    height: $menu-height;

    // @include ideal() {
    //     max-width: $app-width;
    //     margin: 0 auto;
    // }

    &-toggle {
        position: absolute;
        display: none;
        cursor: pointer;
        top: 0;
        left: 0;
        width: $toggle-width;
        height: $menu-height;
        background-color: $color-3;
        color: $color-1;

        span {
            position: absolute;
            font-size: $spacing-large;
            top: 50%;
            left: 50%;
            margin-top: -($spacing-medium * 1.5);
            margin-left: -$spacing-medium;
        }
    }

    &-list {
        @include large() {
            padding-left: $spacing-medium;
            height: inherit;

            h1, button {
                display: inline-block;
                height: inherit;
            }
        }

        @include mobile() {
            position: absolute;
            top: $menu-height;
            display: none;
        }
    }

    @include mobile() {
        position: fixed;
        z-index: $z-index-menu;
        overflow: hidden;
        width: 100%;
        top: 0;
        left: 0;

        &-toggle {
            display: block;
        }
    }
}

.menu-button {
    @include bodyFont();
    display: inline;
    cursor: pointer;
    border: none;
    background: transparent;
    font-weight: bold;
    color: #FFF;
    font-size: 100%;
    margin-right: $spacing-medium;

    &--active {
        color: $color-2;
    }
}

/* mobile view */

@include mobile() {
    .header.expanded {
        height: 100%;

        .header__menu {
            position: absolute;
            overflow-y: auto;
            height: 100%;

            &-list {
                left: 0;
                display: block;
                width: 100%;
                height: 100%;

                button {
                    width: 100%;
                    border: none;
                    border-bottom: 1px solid $color-1;
                    background-color: transparent;
                    padding: $spacing-large;
                    font-size: .85em;
                    @include boxSize();
                }
            }
        }
    }
}
</style>
