<template>
    <div class="fretboard">
        <div v-for="(note, index) in tuning"
             :key="`string_${index}`"
        >
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
        padding: 30px 0;
    }
</style>

