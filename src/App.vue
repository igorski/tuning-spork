<template>
    <div id="app">
        <h1>guitar scale visualiser</h1>
        <!-- instrument interface -->
        <div class="interface">
            <div class="option">
            <label>Instrument</label>
                <select id="instrumentType"
                        @change="changeInstrumentType($event.target.value)"
                >
                    <option v-for="type in ['guitar', 'bass', 'ukelele']"
                            :key="`${type}_instrument`"
                            :selected="type === instrumentType"
                    >{{ type }}</option>
                </select>
            </div>
            <div class="option">
                <label>Amount of strings</label>
                <select id="stringAmount"
                        @change="changeStringAmount($event.target.value)"
                >
                    <option v-for="amount in availableStringAmount"
                            :key="`${amount} strings`"
                            :selected="amount === tuning.length"
                    >{{ amount }}</option>
                </select>
            </div>
        </div>
        <!-- instrument fretboard -->
        <fretboard />
        <!-- scale interface -->
        <div class="interface">
            <div class="option">
                <label>Key / <span class="root-note">root note</span></label>
                <select id="rootNote"
                        @change="changeKey($event.target.value)"
                >
                    <option v-for="note in notes"
                            :key="`note ${note}`"
                            :selected="note === key"
                    >{{ note }}</option>
                </select>
            </div>
            <div class="option">
                <label>Scale</label>
                <select id="scale"
                        @change="changeScale($event.target.value)"
                >
                    <option v-for="scaleName in Object.keys(scales)"
                            :key="`${scaleName} scale`"
                            :selected="scaleName === scale"
                    >{{ scaleName }}</option>
                </select>
            </div>
            <div class="option">
                <label>View</label>
                <select id="viewOption"
                        @change="setViewOption($event.target.value)"
                >
                    <option v-for="option in ['frets', 'notes']"
                            :key="option"
                            :selected="viewOption === option"
                    >{{ option }}</option>
                </select>
            </div>
        </div>
        <!-- chord list -->
        <chords
                v-if="instrumentType === 'guitar'"
        />
        <p>This trinket is <a href="https://www.github.com/igorski/guitar-scale-visualiser" target="_blank">open source</a>. Go make it better.</p>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import Fretboard from './components/fretboard'
import Chords from './components/chords'
import store from './store';

export default {
    name: 'guitar-scale-visualiser',
    store,
    components: {
        Fretboard,
        Chords,
    },
    computed: {
        ...mapState([
            'notes',
            'scales',
            'instrumentType',
            'tuning',
            'key',
            'scale',
            'viewOption',
        ]),
        ...mapGetters([
            'availableStringAmount'
        ])
    },
    methods: {
        ...mapMutations([
            'setInstrumentType',
            'setKey',
            'setScale',
            'setStringAmount',
            'setViewOption',
        ]),
        changeInstrumentType(type) {
            this.setInstrumentType(type);
        },
        changeKey(note) {
            this.setKey(note);
        },
        changeScale(scale) {
            this.setScale(scale);
        },
        changeStringAmount(amount) {
            this.setStringAmount(parseFloat(amount));
        },
    },
};
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin: 20px auto 0;
        max-width: 960px;
    }

    .interface {
        padding: 0;
    }

    .option {
        display: inline;
        margin-right: 12px;

        label {
            margin-right: 7px;
        }

        .root-note {
            color: red;
        }
    }
</style>
