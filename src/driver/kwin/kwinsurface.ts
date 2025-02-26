// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

class KWinSurface implements ISurface {
  private static getHash(s: string): string {
    let hash = 0;
    if (s.length == 0) return `0`;
    for (let i = 0; i < s.length; i++) {
      let charCode = s.charCodeAt(i);
      hash = (hash << 5) - hash + charCode;
      hash = hash & hash;
    }
    return `${hash}`;
  }
  public static generateId(
    screenName: string,
    activity: string,
    desktopName: string
  ): string {
    let path = screenName;
    if (KWINCONFIG.layoutPerActivity) path += "@" + activity;
    if (KWINCONFIG.layoutPerDesktop) path += "#" + desktopName;
    return KWinSurface.getHash(path);
  }

  public readonly id: string;
  public readonly ignore: boolean;
  public readonly workingArea: Rect;

  public readonly output: Output;
  public readonly activity: string;
  public readonly desktop: VirtualDesktop;

  constructor(
    output: Output,
    activity: string,
    desktop: VirtualDesktop,
    workspace: Workspace
  ) {
    //const activityName = activityInfo.activityName(activity);

    this.id = KWinSurface.generateId(output.name, activity, desktop.id);
    this.ignore =
      KWINCONFIG.ignoreActivity.indexOf(activity) >= 0 ||
      KWINCONFIG.ignoreScreen.indexOf(output.name) >= 0 ||
      KWINCONFIG.ignoreVDesktop.indexOf(desktop.name) >= 0;
    this.workingArea = toRect(
      workspace.clientArea(ClientAreaOption.PlacementArea, output, desktop)
    );

    this.output = output;
    this.activity = activity;
    this.desktop = desktop;
  }

  public next(): ISurface | null {
    // TODO: ... thinking about this function
    return null;
    // old: workspace.desktops => int number of virtual desktops. now all desktops objects where window is on and empty list if window on all desktops.
    //if (this.desktop === workspace.desktops)
    /* this is the last virtual desktop */
    /* TODO: option to create additional desktop */
    // return null;

    //return new KWinSurface(this.output, this.activity, this.desktop + 1);
  }

  public toString(): string {
    return (
      "KWinSurface(" +
      [this.output.name, this.activity, this.desktop.name].join(", ") +
      ")"
    );
  }
}
