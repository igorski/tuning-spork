import { describe, it, expect } from "vitest";
import { APP_MODES, VIEW_OPTIONS } from "@/definitions/types";
import store, { createState } from "@/store";

const { getters } = store;

describe( "Vuex store", () => {
    describe( "getters", () => {
        it( "should be able to determine whether the current app mode is the Scale Viewer-mode", () => {
            expect( getters.isScaleViewer( createState({ appMode: APP_MODES.NAME_MY_CHORD }))).toBe( false );
            expect( getters.isScaleViewer( createState({ appMode: APP_MODES.SCALE_VIEWER }))).toBe( true );
        });

        it( "should be able to determine whether the current app mode is the Name My Chord-mode", () => {
            expect( getters.isNameMyChord( createState({ appMode: APP_MODES.NAME_MY_CHORD }))).toBe( true );
            expect( getters.isNameMyChord( createState({ appMode: APP_MODES.SCALE_VIEWER }))).toBe( false );
        });

        describe( "when retrieving the current view option", () => {
            it.each(
                [ VIEW_OPTIONS.FRETS, VIEW_OPTIONS.NOTES, VIEW_OPTIONS.DEGREES ]
            )( `should return support option "%s" (when set) in the Scale Viewer-mode`, viewOption => {
                expect(
                    getters.viewOption( createState({ appMode: APP_MODES.SCALE_VIEWER, viewOption }))
                ).toEqual( viewOption );
            });

            it.each(
                [ VIEW_OPTIONS.FRETS, VIEW_OPTIONS.NOTES ]
            )( `should return support option "%s" (when set) in the Name My Chord-mode`, viewOption => {
                expect(
                    getters.viewOption( createState({ appMode: APP_MODES.NAME_MY_CHORD, viewOption }))
                ).toEqual( viewOption );
            });

            it( `should fall back to "notes" when the previously configured option was "degrees" in Name My Chord-mode`, () => {
                expect(
                    getters.viewOption( createState({ appMode: APP_MODES.NAME_MY_CHORD, viewOption: VIEW_OPTIONS.DEGREES }))
                ).toEqual( VIEW_OPTIONS.NOTES );
            });
        });
    });
});