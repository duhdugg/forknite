import QtQuick;
import org.kde.kwin;

Item {
    id: dbus;

    function getFocusNext() {
        return focusNext;
    }
    ShortcutHandler {
        id: focusNext;

        name: "ForkniteFocusNext";
        text: "Forknite: Focus Next";
        sequence: "";
    }
    function getFocusPrev() {
        return focusPrev;
    }
    ShortcutHandler {
        id: focusPrev;

        name: "ForkniteFocusPrev";
        text: "Forknite: Focus Previous";
        sequence: "";
    }

    function getFocusDown() {
        return focusDown;
    }
    ShortcutHandler {
        id: focusDown;

        name: "ForkniteFocusDown";
        text: "Forknite: Focus Down";
        sequence: "Meta+J";
    }
    function getFocusUp() {
        return focusUp;
    }
    ShortcutHandler {
        id: focusUp;

        name: "ForkniteFocusUp";
        text: "Forknite: Focus Up";
        sequence: "Meta+K";
    }
    function getFocusLeft() {
        return focusLeft;
    }
    ShortcutHandler {
        id: focusLeft;

        name: "ForkniteFocusLeft";
        text: "Forknite: Focus Left";
        sequence: "Meta+H";
    }
    function getFocusRight() {
        return focusRight;
    }
    ShortcutHandler {
        id: focusRight;

        name: "ForkniteFocusRight";
        text: "Forknite: Focus Right";
        sequence: "Meta+L";
    }
    function getShiftDown() {
        return shiftDown;
    }
    ShortcutHandler {
        id: shiftDown;

        name: "ForkniteShiftDown";
        text: "Forknite: Move Down/Next";
        sequence: "Meta+Shift+J";
    }
    function getShiftUp() {
        return shiftUp;
    }
    ShortcutHandler {
        id: shiftUp;

        name: "ForkniteShiftUp";
        text: "Forknite: Move Up/Prev";
        sequence: "Meta+Shift+K";
    }
    function getShiftLeft() {
        return shiftLeft;
    }
    ShortcutHandler {
        id: shiftLeft;

        name: "ForkniteShiftLeft";
        text: "Forknite: Move Left";
        sequence: "Meta+Shift+H";
    }
    function getShiftRight() {
        return shiftRight;
    }
    ShortcutHandler {
        id: shiftRight;

        name: "ForkniteShiftRight";
        text: "Forknite: Move Right";
        sequence: "Meta+Shift+L";
    }
    function getGrowHeight() {
        return growHeight;
    }
    ShortcutHandler {
        id: growHeight;

        name: "ForkniteGrowHeight";
        text: "Forknite: Grow Height";
        sequence: "Meta+Alt+J";
    }
    function getShrinkHeight() {
        return shrinkHeight;
    }
    ShortcutHandler {
        id: shrinkHeight;

        name: "ForkniteShrinkHeight";
        text: "Forknite: Shrink Height";
        sequence: "Meta+Alt+K";
    }
    function getShrinkWidth() {
        return shrinkWidth;
    }
    ShortcutHandler {
        id: shrinkWidth;

        name: "ForkniteShrinkWidth";
        text: "Forknite: Shrink Width";
        sequence: "Meta+Alt+H";
    }
    function getGrowWidth() {
        return growWidth;
    }
    ShortcutHandler {
        id: growWidth;

        name: "ForknitegrowWidth";
        text: "Forknite: Grow Width";
        sequence: "Meta+Alt+L";
    }
    function getIncrease() {
        return increase;
    }
    ShortcutHandler {
        id: increase;

        name: "ForkniteIncrease";
        text: "Forknite: Increase";
        sequence: "Meta+Alt+=";
    }
    function getDecrease() {
        return decrease;
    }
    ShortcutHandler {
        id: decrease;

        name: "ForkniteDecrease";
        text: "Forknite: Decrease";
        sequence: "Meta+Alt+-";
    }
    function getToggleFloat() {
        return toggleFloat;
    }
    ShortcutHandler {
        id: toggleFloat;

        name: "ForkniteToggleFloat";
        text: "Forknite: Toggle Float";
        sequence: "Meta+Alt+F";
    }
    function getFloatAll() {
        return floatAll;
    }
    ShortcutHandler {
        id: floatAll;

        name: "ForkniteFloatAll";
        text: "Forknite: Toggle Float All";
        sequence: "";
    }
    function getNextLayout() {
        return nextLayout;
    }
    ShortcutHandler {
        id: nextLayout;

        name: "ForkniteNextLayout";
        text: "Forknite: Next Layout";
        sequence: "Meta+Space";
    }
    function getPreviousLayout() {
        return previousLayout;
    }
    ShortcutHandler {
        id: previousLayout;

        name: "ForknitePreviousLayout";
        text: "Forknite: Previous Layout";
        sequence: "Meta+Shift+Space";
    }
    function getRotate() {
        return rotate;
    }
    ShortcutHandler {
        id: rotate;

        name: "ForkniteRotate";
        text: "Forknite: Rotate";
        sequence: "Meta+/";
    }
    function getRotatePart() {
        return rotatePart;
    }
    ShortcutHandler {
        id: rotatePart;

        name: "ForkniteRotatePart";
        text: "Forknite: Rotate Part";
        sequence: "Meta+?";
    }
    function getSetMaster() {
        return setMaster;
    }
    ShortcutHandler {
        id: setMaster;

        name: "ForkniteSetMaster";
        text: "Forknite: Set master";
        sequence: "";
    }
    function getTileLayout() {
        return tileLayout;
    }
    ShortcutHandler {
        id: tileLayout;

        name: "ForkniteTileLayout";
        text: "Forknite: Tile Layout";
        sequence: "Meta+T";
    }
    function getMonocleLayout() {
        return monocleLayout;
    }
    ShortcutHandler {
        id: monocleLayout;

        name: "ForkniteMonocleLayout";
        text: "Forknite: Monocle Layout";
        sequence: "Meta+M";
    }
    function getThreeColumnLayout() {
        return treeColumnLayout;
    }
    ShortcutHandler {
        id: treeColumnLayout;

        name: "ForkniteTreeColumnLayout";
        text: "Forknite: Tree Column Layout";
        sequence: "";
    }
    function getSpreadLayout() {
        return spreadLayout;
    }
    ShortcutHandler {
        id: spreadLayout;

        name: "ForkniteSpreadLayout";
        text: "Forknite: Spread Layout";
        sequence: "";
    }
    function getStairLayout() {
        return stairLayout;
    }
    ShortcutHandler {
        id: stairLayout;

        name: "ForkniteStairLayout";
        text: "Forknite: Stair Layout";
        sequence: "";
    }
    function getFloatingLayout() {
        return floatingLayout;
    }
    ShortcutHandler {
        id: floatingLayout;

        name: "ForkniteFloatingLayout";
        text: "Forknite: Floating Layout";
        sequence: "";
    }
    function getQuarterLayout() {
        return quarterLayout;
    }
    ShortcutHandler {
        id: quarterLayout;

        name: "ForkniteQuarterLayout";
        text: "Forknite: Quarter Layout";
        sequence: "";
    }
    function getStackedLayout() {
        return stackedLayout;
    }
    ShortcutHandler {
        id: stackedLayout;

        name: "ForkniteStackedLayout";
        text: "Forknite: Stacked Layout";
        sequence: "";
    }
    function getBTreeLayout() {
        return bTreeLayout;
    }
    ShortcutHandler {
        id: bTreeLayout;

        name: "ForkniteBTreeLayout";
        text: "Forknite: BTree Layout";
        sequence: "";
    }
    function getSpiralLayout() {
        return spiralLayout;
    }
    ShortcutHandler {
        id: spiralLayout;

        name: "ForkniteSpiralLayout";
        text: "Forknite: Spiral Layout";
        sequence: "";
    }
}
