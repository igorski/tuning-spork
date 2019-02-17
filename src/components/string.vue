<template>
    <div class="string-container">
        <select class="string-tuning"
                @change="handleTuningChange($event.target.value)">
            <option v-for="n in notes"
                    :key="`string_${index}_${n}`"
                    :selected="n === note"
            >{{ n }}</option>
        </select>
        <div class="string"
             :style="{ height: `${index}px` }"
        >
            <!-- fret wire -->
            <div v-for="fret in AMOUNT_OF_FRETS"
                 class="fret"
                 :key="`fret ${fret}`"
                 :style="{ left: `${(fret + 1 ) * 100 / AMOUNT_OF_FRETS.length}%`}"
            ></div>
            <!-- app mode 0 : show scale notes -->
            <template v-if="appMode === 0">
                <div v-for="fret in AMOUNT_OF_FRETS"
                     v-if="isNoteInScale(fret)"
                     class="note"
                     :key="`string ${index} fret ${fret}`"
                     :style="{ left: `${fret * 100 / AMOUNT_OF_FRETS.length}%`}"
                     :class="{ root: getNoteByFret(fret) === key, decimal: fret > 9 }"
                ><span>{{ viewOption === 'frets' ? fret : getNoteByFret(fret) }}</span></div>
            </template>
            <!-- app mode 1 : allow manual fretting of string -->
            <template v-else>
                <div v-for="fret in AMOUNT_OF_FRETS"
                     class="note"
                     :key="`string ${index} fret ${fret}`"
                     :class="{ hidden: fret !== activeFret }"
                     :style="{ left: `${fret * 100 / AMOUNT_OF_FRETS.length}%`}"
                     @click="activeFret !== fret ? activeFret = fret : activeFret = undefined"
                 ><span>{{ fret }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

const AMOUNT_OF_FRETS = [];
// one octave is enough, yo
for (let i = 0; i < 13; ++i) {
    AMOUNT_OF_FRETS.push(i);
}

export default {
    props: {
        index: {
            type: Number,
            required: true
        }
    },
    data: () => ({
        AMOUNT_OF_FRETS,
    }),
    computed: {
        ...mapState([
            'chord',
            'appMode',
            'notes',
            'tuning',
            'key',
            'viewOption',
        ]),
        ...mapGetters([
            'availableScaleNotes',
        ]),
        note() {
            // is open string note for the current tuning
            return this.tuning[this.index];
        },
        activeFret: {
            get() {
                return this.chord[this.index];
            },
            set(value) {
                this.setChordStringFretIndex({ index: this.index, value });
            }
        }
    },
    methods: {
        ...mapMutations([
            'tuneString',
            'setChordStringFretIndex'
        ]),
        isNoteInScale(fret) {
            return this.availableScaleNotes.includes(this.getNoteByFret(fret));
        },
        getNoteByFret(fret) {
            const rootNoteIndex = this.notes.indexOf(this.note);
            return this.notes[(rootNoteIndex + fret) % this.notes.length];
        },
        handleTuningChange(note) {
            this.tuneString({ index: this.index, note });
        }
    }
};
</script>

<style lang="scss" scoped>

    $size: 40px;

    .string-container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        height: $size;
    }

    .string {
        position: relative;
        min-height: 1px;
        margin-top: 10px;
        width: 100%;
        background-color: #000;

        .fret {
            position: absolute;
            width: 2px;
            height: $size;
            top: -($size / 2);
            background-color: grey;

            // nut
            &:first-child {
                width: 6px;
                background-color: #d6d6d6;
            }
        }

        .note {
            position: absolute;
            top: -18px;
            width: $size / 2;
            height: $size / 2;
            margin-left: ($size / 2);
            background-color: #FFF;
            border: 2px solid blue;
            border-radius: 50%;
            padding: 5px;
            font-weight: bold;

            &.root {
                border-color: red;
            }

            span {
                position: absolute;
                left: 0;
                width: 100%;
            }

            &.hidden {
                opacity: 0;
            }
        }
    }
</style>
