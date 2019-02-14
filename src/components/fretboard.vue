<template>
    <div class="fretboard">
        <div v-for="(note, index) in tuning">
            <string :index="index" />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import String from './string';

export default {
    components: {
        String
    },
    computed: {
        ...mapState([
            'tuning'
        ])
    }
};
</script>

<style lang="scss">
    .fretboard {
        width: 100%;
        padding-top: 10px;
    }
</style>

