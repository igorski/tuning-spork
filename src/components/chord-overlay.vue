<template>
    <div id="chord-overlay">
        <h2>{{ chord.name }}</h2>
        <!-- provide a chord as close to being an open chord (e.g. starting from fret 0) -->
        <chord :chord="chord" />
        <!-- provide alternate fingerings higher up the neck -->
        <chord :chord="chord" :fret="4" class="offset" />
        <chord :chord="chord" :fret="8" class="offset" />
    </div>
</template>

<script>
import Chord from './chord';

export default {
    components: { Chord },
    props: {
        chord: {
            type: Object,
            required: true
        }
    }
};
</script>

<style lang="scss" scoped>
    #chord-overlay {
        position: fixed;
        top: 50px;
        left: 50%;
        border: 3px solid #000;
        border-radius: 7px;
        background-color: rgba(255,200,200,.90);
        width: 50%;
        margin-left: -25%;
        height: 250px;
        pointer-events: none;
    }

    .offset {
        margin-left: 50px;
    }
</style>
