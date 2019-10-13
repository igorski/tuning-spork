<template>
    <div>
        <chord-overlay
            v-if="selectedChord !== null"
            :chord="selectedChord"
        />
        <h2>Available chords</h2>
        <p>
            These chords fit the chosen scale. You can use the above scale to improvise freely
            over a chord progression made of below chords.
            Hover over the chord to view recommended fingerings for your instrument and its tuning.
        </p>
        <div v-for="chordObject in availableScaleChords"
             :key="chordObject.name"
             class="chord"
             @mouseover="selectedChord = chordObject"
             @mouseout="selectedChord = null"
        >
            {{ chordObject.name }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ChordOverlay from './chord-overlay';

export default {
    components: {
        ChordOverlay,
    },
    data: () => ({
        selectedChord: null,
    }),
    computed: {
        ...mapGetters([
            'availableScaleChords'
        ]),
    },
};
</script>

<style lang="scss" scoped>
    .chord {
        cursor: pointer;
        display: inline-block;
        padding: 10px;
        border-radius: 7px;
        border: 2px solid #999;
        margin: 0 7px 7px;
    }
</style>
