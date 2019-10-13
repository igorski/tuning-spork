<template>
    <div class="chord-wrapper">
        <div class="fretboard"
        >
            <div v-for="(note, stringIndex) in strings"
                 :key="`string_${stringIndex}`"
                 class="string"
                 :style="{ left: `${stringIndex / tuning.length * 100}%` }"
            >
                {{ note }}
                <div v-for="fret in visibleFretRange"
                     :key="fret"
                     class="fret-marker"
                     :style="{ top: `{fret / frets * 100}%`}"
                >
                    {{ stringIndex >= firstString && frettedNotes[stringIndex] === fret ? fret : '' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    props: {
        // the fretted notes in the rendered shape
        frettedNotes: {
            type: Array,
            required: true
        },
        // the starting fret position for which the shape was rendered
        firstFret: {
            type: Number,
            required: true,
        },
        firstString: {
            type: Number,
            default: 0,
        },
        visibleFrets: {
            type: Number,
            default: 4,
        }
    },
    computed: {
        ...mapState([
            'tuning',
        ]),
        ...mapGetters([
            'fretRange',
        ]),
        strings() {
            return [...this.tuning].reverse();
        },
        visibleFretRange() {
            return this.fretRange(this.firstFret, this.visibleFrets);
        },
    },
    methods: {

    }
};
</script>

<style lang="scss" scoped>
    .chord-wrapper {
        display: inline-block;
        width: 120px;
        height: 80px;
        vertical-align: top;
        text-align: center;
    }

    .fretboard {
        position: relative;
        border-right: 1px solid grey;
        height: inherit;
    }

    .string {
        position: absolute;
        color: #000;
        font-weight: bold;
        width: 10px;
        height: 100%;
        top: 0;
        border-left: 1px solid grey;
    }

    .fret-marker {
        display: block;
        width: 20px;
        height: 20px;
    }
</style>
