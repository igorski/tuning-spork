/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019-2022 Igor Zinken - https://www.igorski.nl
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
import Scales from "@/definitions/scales.json";
import Pitch from "@/utils/pitch-util";

const NOTES_IN_OCTAVE = Pitch.OCTAVE_SCALE.length;

export const getCompatibleScalesForIntervals = intervals => {
    const out = [];

    const sanitizedIntervals = intervals.map( interval => {
        while ( interval >= 12 ) {
            interval -= 12;
        }
        return interval;
    });

    Object.keys( Scales ).forEach( scaleName => {
        if ( sanitizedIntervals.every( interval => Scales[ scaleName ].intervals.includes( interval ))) {
            out.push( scaleName );
        }
    });
    return out;
};

export const getCompatibleScalesForNotes = ( notes, optNoteToExclude ) => {
    const out = {};

    Object.keys( Scales ).forEach( scaleName => {
        Pitch.OCTAVE_SCALE.forEach( rootNote => {
            if ( optNoteToExclude === rootNote ) {
                return;
            }
            const scale = intervalsToNotes( Scales[ scaleName ].intervals, rootNote );
            if ( notes.every( note => scale.includes( note )) ) {
                if ( !out[ rootNote ]) {
                    out[ rootNote ] = [];
                }
                out[ rootNote ].push( scaleName );
            }
        });
    });
    return Object.entries( out )
        .map(([ key, scales ]) => ({ root: key, scales }))
        .sort(( a, b ) => a.root > b.root ? 1 : - 1 );
};

export const intervalsToNotes = ( intervals, rootNote = "C" ) => {
    const rootIndex = Pitch.OCTAVE_SCALE.indexOf( rootNote );
    return intervals.map( interval => {
        return Pitch.OCTAVE_SCALE[( rootIndex + interval ) % NOTES_IN_OCTAVE ]
    });
};

export const notesToIntervals = notes => {
    const rootIndex = Pitch.OCTAVE_SCALE.indexOf( notes[ 0 ]);
    return notes.map( note => {
        const noteIndex = Pitch.OCTAVE_SCALE.indexOf( note );
        return ( noteIndex < rootIndex ? noteIndex + NOTES_IN_OCTAVE : noteIndex ) - rootIndex;
    });
};

export const fretRange = ( startFret = 0, visibleFrets = 4 ) => {
    const out = [];
    for ( let i = 0; i <= visibleFrets; ++i ) {
        out[ i ] = startFret + i;
    }
    return out;
};
