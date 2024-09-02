# Forknite

A fork of a fork of a dynamic tiling extension for Plasma 6 Wayland.

Forknite is a fork of a fork of Kröhnkite, which is "mainly inspired by [dwm][] from
suckless folks, and aims to provide rock solid stability while fully integrating into
KWin". Anyway, user aneametologin put a lot of work in his fork which made it work on
Plasma 6 Wayland sessins. I think I just want to start with that and make it work a
little more like my old bspwm configuration.


[anametologin fork which works on plasma 6](https://github.com/anametologin/krohnkite)
[original krohnkite repo](https://github.com/esjeon/krohnkite)
[dwm]: https://dwm.suckless.org/

![screenshot](img/screenshot.png)

## Features

- DWM-like window tiling
  - Dynamically tile windows, rather than manually placing each.
  - Floating windows
- Fully integrates into KWin features, including:
  - **Multi-screen**
  - **Activities & Virtual desktop**
  - Basic window management (minimize, fullscreen, switching, etc)
- Multiple Layout Support
  - Tiling layout
  - Monocle layout
  - Desktop-friendly layouts (Spread, Stair)

## Development Requirement

- Typescript (tested w/ 3.1.x)
- GNU Make
- p7zip (7z)

## Look at me

1. Delete unused KWin shortcuts:

```
qdbus org.kde.kglobalaccel /component/kwin org.kde.kglobalaccel.Component.cleanUp
```

2. If you have a gap or vice versa you have gray(white etc) rectangle that means that there is a program with size 1x1 that have to be filtered by title or other ways. Make sure that the following programs, if you have them, have been added to the filter:

```
xwaylandvideobridge,plasmashell,ksplashqml

```

## Installation

You can install Forknite in multiple ways.

### Using .kwinscript package file

You can download `forknite-x.x.kwinscript` file, and install it through
_System Settings_.

1.  Download the kwinscript file
2.  Open `System Settings` > `Window Management` > `KWin Scripts`
3.  Press `Import KWin script...` on the top-right corner
4.  Select the downloaded file

Alternatively, through command-line:

    kpackagetool6 -t KWin/Script -i forknite.kwinscript # installing new script
    kpackagetool6 -t kwin/script -u forknite.kwinscript # upgrading existing script

To uninstall the package:

```
kpackagetool6 -t kwin/script -r forknite
```

### Installing from Git repository

The simplest method would be:

    make install
    make uninstall # to uninstall the script

This will automatically build and install kwinscript package.

You can also manually build package file using:

    make package

The generated package file can be imported from "KWin Script" dialog.

### Simply Trying Out

Forknite can be temporarily loaded without installing the script:

    make run
    make stop

Note that Forknite can destroy itself completely once it is disabled, so no
restart is required to deactivated it.

## Settings

### Choose layout for screen by default

1. Right after system boot run KSystemLog
2. Push ignore button
3. Type in filter string: `forknite`
4. Right after `FORKNITE
5. Copy your screen name. This name usually your video port DP-2 or HDMI-A-1 or Virtual-1 for VM or something like that
6. Open Forknite options: ![options](img/conf.png)
7. Tab `Rules->Screen default layout` and type `YOUR_SCREEN_NAME:LAYOUT_ID` for example: `HDMI-A-1:2,DP-2:7`, or if you have multiple `Virtual Desktop` on screen you can write `SCREEN_NAME:DESKTOP_NAME:LAYOUT_ID`. More examples: `:2` - makes layout#2 default on all screens, `:Desktop 1:2` - makes layout#2 default on all desktops with name `Desktop 1`
8. `Apply` -> `reboot`

[Video: assign default layer for screen](https://github.com/anametologin/forknite/assets/165245883/f569f1de-1721-4cdf-b3fb-96782a3e3189)

### Search a window parameters to filter, float etc.

1. Forknite options: ![options](img/conf.png)
2. Options->Debug new Windows
3. Reboot
4. Run KSystemLog
5. Push `Ignore` button
6. Type in filter string: `forknite`
7. All created windows forknite working with will be there.
8. Every debug entry contains parameters except those that are false and empty.

## Default Key Bindings

🚧 See `res/shortcuts.qml`

<!-- | Key              | Action             | -->
<!-- | ---------------- | ------------------ | -->
<!-- | Meta + .         | Focus Next         | -->
<!-- | Meta + ,         | Focus Previous     | -->
<!-- |                  |                    | -->
<!-- | Meta + J         | Focus Down         | -->
<!-- | Meta + K         | Focus Up           | -->
<!-- | Meta + H         | Focus Left         | -->
<!-- | Meta + L         | Focus Right        | -->
<!-- |                  |                    | -->
<!-- | Meta + Shift + J | Move Down/Next     | -->
<!-- | Meta + Shift + K | Move Up/Previous   | -->
<!-- | Meta + Shift + H | Move Left          | -->
<!-- | Meta + Shift + L | Move Right         | -->
<!-- |                  |                    | -->
<!-- | Meta + I         | Increase           | -->
<!-- | Meta + D         | Decrease           | -->
<!-- | Meta + F         | Toggle Floating    | -->
<!-- | Meta + \         | Cycle Layout       | -->
<!-- |                  |                    | -->
<!-- | Meta + Return    | Set as Master      | -->
<!-- |                  |                    | -->
<!-- | Meta + T         | Use Tile Layout    | -->
<!-- | Meta + M         | Use Monocle Layout | -->
<!-- | _unbound_        | Use Spread Layout  | -->
<!-- | _unbound_        | Use Stair Layout   | -->

## Tips

### Setting Up for Multi-Screen

Forknite supports multi-screen setup, but KWin has to be configured to unlock
the full potential of the script.

1. Enable `Separate Screen Focus` feature:

- `System Settings` > `Window Management` > `Window Behavior` > `Multiscreen Behaviour`

  `OR` use console commands:

```
   kwriteconfig6 --file ~/.config/kwinrc --group Windows --key ActiveMouseScreen false
   kwriteconfig6 --file ~/.config/kwinrc --group Windows --key SeparateScreenFocus true
```

<!-- 2. Bind keys for global shortcut `Switch to Next/Previous Screen` -->
<!--    (Recommend: `Meta + ,` / `Meta + .`) -->
<!-- 3. Bind keys for global shortcut `Window to Next/Previous Screen` -->
<!--    (Recommend: `Meta + <` / `Meta + >`) -->

### Removing Title Bars

Breeze window decoration can be configured to completely remove title bars from
all windows:

1. `System Setting` > `Application Style` > `Window Decorations`
2. Click `Configure Breeze` inside the decoration preview.
3. `Window-Specific Overrides` tab > `Add` button
4. Enter the followings, and press `Ok`:
   - `Regular expression to match`: `.*`
   - Tick `Hide window title bar`

### Changing Border Colors

Changing the border color makes it easier to identify current window. This is
convinient if title bars are removed.

1. You can use the Oxygen decoration theme. [Oxygen theme settings][]
1. You can install third-party decorations, see [Border color conversation][]

[Oxygen theme settings]: https://github.com/anametologin/forknite/assets/165245883/51b4cb48-33c7-4627-a119-33d1abbe2b99
[Border color conversation]: https://github.com/anametologin/forknite/issues/15

### Setting Minimum Geometry Size

Some applications like discord and KDE settings dont tile nicely as they have a minimum size requirement.
This causes the applications to overlap with other applications. To mitigate this we can set minimum size for all windows to be 0.

1. `System Setting` > `Window Management` > `Window Rules`
2. Click on `+ Add New...`
3. Set `Window class` to be `Unimportant`
4. Set `Window types` to `Normal Window`
5. Click `+ Add Properties...`
6. Add the `Minimum Size` Property
7. Set the fields to `Force` and `0` x `0`
8. Apply

### Prevent borders and shadows from disappearing.

When a window is marked "maximized" in Breeze theme, its borders are removed to save screen space.
This behavior may not be preferable depending on your setup. This can be mitigated by disabling maximized windows using Window Rules.

1. `System Setting` > `Window Management` > `Window Rules`
2. Click on `+ Add New...`
3. Set `Window class` to be `Unimportant`
4. Set `Window types` to `Normal Window`
5. Click `+ Add Properties...`
6. Add the `Maximized horizontally` and `Maximized vertically` Properties.
7. Set the options to `Force` and `No`.
8. Apply

## Useful Development Resources

- [KWin Scripting Tutorial](https://techbase.kde.org/Development/Tutorials/KWin/Scripting)
- [KWin Scripting API](https://develop.kde.org/docs/plasma/kwin/api/)
- Adding configuration dialog
  - [Development/Tutorials/Plasma/JavaScript/ConfigDialog](https://techbase.kde.org/Development/Tutorials/Plasma/JavaScript/ConfigDialog)
  - [Development/Tutorials/Using KConfig XT](https://techbase.kde.org/Development/Tutorials/Using_KConfig_XT)
- `*.ui` files can be edited with [Qt Designer](http://doc.qt.io/qt-5/qtdesigner-manual.html).
  It's very straight-forward if you're used to UI programming.
