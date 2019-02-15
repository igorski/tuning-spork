<template>
    <div>
        <h2>Available chords</h2>
        <p>
            These chords fit the chosen scale. You can use the above scale to improvise freely
            over a chord progression made of below chords.
            <b>Note:</b> the chord viewer is under development. Fingerings relative to the chosen tuning
            will be available in subsequent releases.
        </p>
        <div v-for="chord in availableScaleChords"
             :key="chord"
             class="chord"
        >
            {{ chord }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters([
            'availableScaleChords'
        ]),
    },
};
</script>

<style lang="scss" scoped>
    .chord {
        display: inline-block;
        padding: 10px;
        border-radius: 7px;
        border: 2px solid #999;
        margin: 0 7px 7px;
    }
</style>
