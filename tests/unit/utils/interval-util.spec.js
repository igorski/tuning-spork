import { intervalsToNotes, notesToIntervals } from "@/utils/interval-util";

describe( "Interval utility", () => {
    it( "should be able to convert a list of intervals to a list of notes", () => {
        const intervals = [ 0, 2, 3, 5, 7, 8, 10 ];
        expect( intervalsToNotes( intervals )).toEqual([
            "C", "D", "D#", "F", "G", "G#", "A#"
        ]);
    });

    it( "should be able to convert a list of intervals to a list of notes, when providing a custom root note", () => {
        const intervals = [ 0, 2, 4, 5, 7, 9, 11 ];
        expect( intervalsToNotes( intervals, "E" )).toEqual([
            "E", "F#", "G#", "A", "B", "C#", "D#"
        ]);
    });

    it( "should be able to convert a list of notes to a list of intervals, relative to the first note", () => {
        const notes = [ "E", "F#", "G#", "A", "B", "C#", "D#" ];
        expect( notesToIntervals( notes )).toEqual([ 0, 2, 4, 5, 7, 9, 11 ]);
    });
});
