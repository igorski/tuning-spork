<template>
    <header class="header" :class="{ expanded: menuOpened }">
        <nav class="menu">
            <div class="toggle" @click="setMenuOpened(!menuOpened)">
                <span>&#9776;</span>
            </div>
            <!-- <h1>Pluck!</h1> -->
            <div class="menu-list">
                <button :class="{ 'active': appMode === 0 }" type="button" @click="scaleGeneratorClick()">Scale generator</button>
                <button :class="{ 'active': appMode === 1 }" type="button" @click="nameMyChordClick()">Name my chord!</button>
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
    @import '@/styles/layout.scss';

    .header {
        width: 100%;
        height: $menu-height;
        position: fixed;
        top: 0;
        left: 0;
        z-index: $z-index-header;

        h1 {
          color: #FFF;
          display: inline;
          margin: 0;
          padding: 0;
          padding-right: $spacing-medium;
          font-size: 110%;
        }
    }

    .toggle {
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

    .menu {
        background-color: $color-2;
        height: $menu-height;
    }

    .menu-list button {
        display: inline;
        cursor: pointer;
    }

    /* anything above mobile */

    @media screen and ( min-width: $mobile-width ) {
        .menu-list {
            padding-top: $spacing-small;

            button {
                @include button();
            }
        }
    }

    /* mobile view */

    @media screen and ( max-width: $mobile-width ) {
        header.expanded {
            height: 100%;

            .menu {
                position: absolute;
                overflow-y: auto;
                height: 100%;

                .menu-list {
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
                        @include boxSize;
                    }
                }
            }
        }

      .menu {
        position: fixed;
        z-index: $z-index-menu;
        overflow: hidden;
        width: 100%;
        top: 0;
        left: 0;

        .toggle {
            display: block;
        }

        h1 {
            display: none;
        }

        .menu-list {
            position: absolute;
            top: $menu-height;
            background-image: linear-gradient(to bottom,#fff 35%,#eee 90%);
            background-repeat: repeat-x;
            display: none;
        }
    }
  }
</style>
