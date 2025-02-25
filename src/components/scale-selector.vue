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
    <div class="scale-selector">
        <button
            type="button"
            class="close-button secondary"
            @click="handleClose()"
        >&#x2715;</button>
        <div class="scale-selector__option scale-selector__key-select">
            <label>Key / <span class="root-note">root note</span></label>
            <model-select
                v-model="selectedKey"
                :options="availableNotes"
                :is-disabled="!enabled"
                class="scale-selector__select small-list"
            />
        </div>
        <model-select
            :options="availableScales"
            :dropdown-should-open="false"
            :is-disabled="!enabled"
            class="scale-selector__select search-only"
            placeholder="Find scale by name"
            @update:modelValue="handleScaleSearch( $event )"
        />
        <ul
            ref="scaleList"
            class="scale-list"
        >
            <div v-if="!enabled" class="explanation">
                Found a sweet soundin' chord and you're curious what it is called ? Just fret the strings
                on the fretboard and we'll tell you what you are playing (and what scales go with it).
            </div>
            <li
                v-for="{ value, shortName } in availableScales"
                :key="value"
                class="scale-list__entry"
                :data-value="value"
                :class="{ selected: value === selectedScale }"
            >
                <button
                    type="button"
                    class="scale-list__entry-button"
                    @click="selectedScale = value"
                >{{ shortName }}</button>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { ModelSelect } from "vue-search-select";
import { mapSelectOptions } from "@/utils/select-util";
import { ucFirst } from '@/utils/string-util';

export default {
    emits: [ "close" ],
    components: {
        ModelSelect,
    },
    props: {
        enabled: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        ...mapState([
            "key",
            "notes",
            "scale",
            "scales",
        ]),
        ...mapGetters([
            "isMobile",
        ]),
        availableNotes() {
            return mapSelectOptions( this.notes );
        },
        availableScales() {
            if ( !this.enabled ) {
                return [];
            }
            return Object.entries( this.scales ).map(([ value, data ]) => {
                let text = value;
                if ( Array.isArray( data.names )) {
                    text = `${value} / ${data.names.join( " / ")}`;
                }
                return { text: ucFirst( text ), value, shortName: ucFirst( value ) };
            }).sort(( a, b ) => a.text > b.text ? 1 : -1 );
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
    },
    watch: {
        selectedScale() {
            if ( this.isMobile ) {
                this.setScaleSelectorOpened( false );
            }
        },
        enabled: {
            immediate: true,
            async handler( value ) {
                if ( value ) {
                    await this.$nextTick();
                    this.scrollToSelection();
                }
            }
        }
    },
    methods: {
        ...mapMutations([
            "setKey",
            "setScale",
            "setScaleSelectorOpened",
        ]),
        handleClose() {
            this.$emit( "close" );
        },
        handleScaleSearch( scale ) {
            this.selectedScale = scale;
            this.scrollToSelection();
        },
        scrollToSelection() {
            const scaleList = this.$refs.scaleList;
            if ( !scaleList ) {
                return;
            }
            scaleList.querySelector( `[data-value="${this.selectedScale}"]`)?.scrollIntoView?.({
                behavior : "smooth",
                block    : "center",
                inline   : "nearest"
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@use "@/styles/_mixins";
@use "@/styles/_variables";
@use "@/styles/ui";

.scale-selector {
    @include mixins.boxSize();
    @include mixins.noSelect();
    background-color: variables.$color-5;
    padding: variables.$spacing-large;
    text-align: left;
 
    @include mixins.large() {
        min-width: variables.$scale-selector-width;
        max-width: variables.$scale-selector-width;
    }

    @include mixins.mobile() {
        &__key-select {
            display: initial !important;
        }
    }

    @include mixins.hiddenOnMobile();

    &__option {
        @include ui.formField();

        & {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
    }

    &__select {
        @include ui.selectField();

        &.search-only {
            margin: variables.$spacing-small 0;
        }
    }

    .root-note {
        color: variables.$color-2;
    }
}

.scale-list {
    @include mixins.scrollablePanel( 118px );

    & {
        list-style-type: none;
        margin: variables.$spacing-medium 0;
        padding: 0;

        &__entry {
            border-bottom: 1px solid variables.$color-5;

            &-button {
                width: 100%;
                height: 100%;
                font-size: 0.9em;
                text-align: left;
                padding: variables.$spacing-small;
                background: none;
                border: none;
                color: variables.$color-text;
                cursor: pointer;

                &:hover {
                    color: variables.$color-3;
                    text-indent: variables.$spacing-xsmall;
                }
            }

            &.selected {
                // background-color: variables.$color-3;

                .scale-list__entry-button {
                    color: variables.$color-2;
                }
            }
        }
    }
}
</style>
