/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2021-2022 Igor Zinken - https://www.igorski.nl
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
    <div class="tuner">
        <h2 class="tuner__title">Tuner</h2>
        <button
            type="button"
            class="close-button"
            @click="$emit('close')"
        >&#x2715;</button>
        <div class="content">
            <p>
                To tune your instrument, first select an audio input (such as
                your device's microphone) below:
            </p>
            <model-select
                v-model="selectedInput"
                :options="availableInputs"
                :disabled="!inputs.length"
            />
            <div class="tuner__ui">
                <div class="tuner__pitch__note">{{ note }}{{ octave }}</div>
                <div class="tuner__pitch">
                    <div
                        class="tuner__pitch__pointer"
                        :style="{ left: pointer.pos }"
                        :class="pointer.class"
                    ></div>
                </div>
            </div>
            <button
                type="button"
                class="button"
                @click="toggleListen( !listening )"
            >{{ listening ? 'Stop' : 'Listen' }}</button>
        </div>
    </div>
</template>

<script>
import { ModelSelect } from "vue-search-select";
import { getAudioContext, createPitchAnalyser } from "@/utils/audio-util";
import { detectPitch, getPitchByFrequency } from "@/utils/pitch-util";

const THRESHOLD = 5; // threshold in cents a note can be sharp/flat but considered "in tune"

export default {
    components: {
        ModelSelect
    },
    data: () => ({
        inputs: [],
        selectedInput: "0",
        note: "",
        octave: 0,
        listening: false,
        pointer: {
            pos: "50%",
            class: "tuned"
        }
    }),
    computed: {
        availableInputs() {
            return this.inputs
                .map(( input, index ) => ({ text: input.label, value : index.toString() }));
        },
    },
    async created() {
        try {
            // by requesting getUserMedia we trigger permission window
            await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            // once we have permission, we immediately request the available audio inputs
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.inputs = devices.filter(({ kind }) => kind === "audioinput" );
        } catch {
            this.handleError();
        }
    },
    beforeDestroy() {
        this.unlisten();
    },
    methods: {
        async toggleListen( enabled ) {
            if ( this.listening === enabled ) {
                return;
            }
            if ( !enabled ) {
                return this.unlisten();
            }
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId : this.inputs[ parseFloat( this.selectedInput )].deviceId }
            });
            const audioContext = getAudioContext();
            const node = audioContext.createMediaStreamSource( this.stream );
            this.pitchAnalyser = createPitchAnalyser( node, audioContext );

            this.updateFn = this.update.bind( this );
            this.updateFn();

            this.listening = enabled;
        },
        unlisten() {
            window.cancelAnimationFrame( this.raf );
            this.pitchAnalyser?.disconnect();
            for ( const track of ( this.stream?.getAudioTracks() || [] )) {
                track.stop();
            }
            this.listening = false;
        },
        update() {
            const frequency = detectPitch( this.pitchAnalyser, getAudioContext() );
            if ( frequency ) {
                const pitch = getPitchByFrequency( frequency );

                this.note   = pitch.note;
                this.octave = pitch.octave;

                this.pointer.pos   = `${50 + pitch.cents}%`;
                this.pointer.class = pitch.cents <= THRESHOLD && pitch.cents >= -THRESHOLD ? "tuned" : "off";
            }
            this.raf = window.requestAnimationFrame( this.updateFn );
        }
    },
};
</script>

<style lang="scss" scoped>
@import "@/styles/_variables";
@import "@/styles/_mixins";

.tuner {
    @include overlay( 400px, 360px );
    text-align: center;

    &__title {
        margin: 0;
    }

    .content {
        padding-top: 0;
    }

    .close-button {
        top: #{$spacing-medium + $spacing-small};
    }

    &__ui {
        padding: $spacing-large 0;
    }

    &__pitch {
        position: relative;
        width: 200px;
        height: 2px;
        background-color: #666;
        margin: $spacing-medium auto;

        &__note {
            font-size: 200%;
            font-weight: bold;
        }

        &__pointer {
            $pointerSize: $spacing-large;
            position: absolute;
            width: $pointerSize;
            height: $pointerSize;
            bottom: -#{$pointerSize / 2};
            margin-left: -#{$pointerSize / 2};
            border-radius: 50%;
            transition: left 250ms;

            &.off {
                background-color: red;
            }

            &.tuned {
                background-color: green;
            }
        }
    }
}
</style>
