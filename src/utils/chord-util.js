/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Igor Zinken - https://www.igorski.nl
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
 import Chords from '@/definitions/chords.json';

/**
 * Get the name of the chord described by given intervals
 *
 * @param {Array<number>} intervals
 * @return {string|null}
 */
export const getChordByIntervals = intervals => {
     let out = null;
     Object.keys(Chords).forEach(chordName => {
         if (JSON.stringify(Chords[chordName]) === JSON.stringify(intervals)) {
             out = chordName;
         }
     });
     return out;
 };

/**
 * Whether given chord is a power chord
 *
 * @param {name: string, notes: Array<string>} chord
 * @return {boolean}
 */
export const isPowerChord = chord => {
    // TODO being lazy and assuming chord name is correct, we
    // should check the notes for containing a root and fifth only
    const chordName = chord.name.replace(' ', '');
    return chordName.length === 2 && chordName.charAt(1) === '5';
};
