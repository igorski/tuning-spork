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
    <header class="header" :class="{ expanded: menuOpened }">
        <nav class="header__menu">
            <div class="header__menu-toggle" @click="setMenuOpened( !menuOpened )">
                <span>&#9776;</span>
            </div>
            <div class="header__menu-list">
                <h1 class="header__title">Tuning spork!</h1>
                <button
                    type="button"
                    class="menu-button"
                    :class="{ 'menu-button--active': appMode === 0 }"
                    @click="scaleViewerClick()"
                >Scale viewer</button>
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
import { mapState, mapMutations } from "vuex";

export default {
    data: () => ({
        menuOpened: false,
    }),
    computed: {
        ...mapState([
            "appMode",
        ]),
    },
    methods: {
        ...mapMutations([
            "setAppMode",
            "setConfigurationOpened",
            "setScaleSelectorOpened",
        ]),
        setMenuOpened( opened ) {
            this.menuOpened = opened;
            if ( opened ) {
                this.setConfigurationOpened( false );
                this.setScaleSelectorOpened( false );
            }
        },
        scaleViewerClick() {
            this.setAppMode( 0 );
            this.setMenuOpened( false );
        },
        nameMyChordClick() {
            this.setAppMode( 1 );
            this.setMenuOpened( false );
        },
    }
};
</script>

<style lang="scss" scoped>
@use "@/styles/_typography";
@use "@/styles/_mixins";
@use "@/styles/_variables";
@use "@/styles/layout";

.header {
    width: 100%;
    height: variables.$menu-height;
    position: fixed;
    background-color: variables.$color-5;
    top: 0;
    left: 0;
    z-index: variables.$z-index-header;

    @include mixins.ideal() {
        border-top-left-radius: variables.$spacing-medium;
        border-top-right-radius: variables.$spacing-medium;
        width: variables.$ideal-width;
        left: calc(50% - #{variables.$ideal-width / 2});
        top: variables.$app-ideal-top-margin;
    }

    &__title {
        display: inline;
        color: #FFF;
        margin: 0 #{((variables.$spacing-xlarge) * 2) + variables.$spacing-large} 0 variables.$spacing-medium;

        @include mixins.mobile() {
            display: none;
        }
    }

    &__menu {
        height: variables.$menu-height;

        @include mixins.ideal() {
            max-width: variables.$ideal-width;
            margin: 0 auto;
        }

        &-toggle {
            position: absolute;
            display: none;
            cursor: pointer;
            top: 0;
            left: 0;
            width: variables.$toggle-width;
            height: variables.$menu-height;
            background-color: variables.$color-3;
            color: variables.$color-1;

            span {
                position: absolute;
                font-size: variables.$spacing-large;
                top: 50%;
                left: 50%;
                margin-top: -(variables.$spacing-medium * 1.5);
                margin-left: -(variables.$spacing-medium);
            }
        }

        &-list {
            @include mixins.large() {
                padding-left: variables.$spacing-medium;
                height: inherit;

                h1, button {
                    display: inline-block;
                    height: inherit;
                }
            }

            @include mixins.mobile() {
                position: absolute;
                top: variables.$menu-height;
                display: none;
            }
        }

        @include mixins.mobile() {
            position: fixed;
            z-index: variables.$z-index-menu;
            overflow: hidden;
            width: 100%;
            top: 0;
            left: 0;

            &-toggle {
                display: block;
            }
        }
    }

    @include mixins.mobile() {
        &.expanded {
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
                        border-bottom: 1px solid variables.$color-1;
                        background-color: transparent;
                        padding: variables.$spacing-large;
                        font-size: .85em;
                        @include mixins.boxSize();
                    }
                }
            }
        }
    }
}

.menu-button {
    @include typography.bodyFont();
    display: inline;
    cursor: pointer;
    border: none;
    background: transparent;
    font-weight: bold;
    color: #FFF;
    font-size: 100%;
    margin-right: variables.$spacing-medium;

    &--active {
        color: variables.$color-2;
    }
}
</style>
