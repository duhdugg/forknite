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

class KWinWindow implements IDriverWindow {
  public static generateID(w: Window) {
    return w.internalId.toString();
  }

  private readonly workspace: Workspace;
  public readonly window: Window;
  public readonly id: string;

  public get fullScreen(): boolean {
    return this.window.fullScreen;
  }

  public get geometry(): Rect {
    return toRect(this.window.frameGeometry);
  }

  public get shouldIgnore(): boolean {
    if (this.window.deleted) return true;
    const resourceClass = String(this.window.resourceClass);
    const resourceName = String(this.window.resourceName);
    const windowRole = String(this.window.windowRole);
    return (
      this.window.specialWindow ||
      resourceClass === "plasmashell" ||
      KWINCONFIG.ignoreClass.indexOf(resourceClass) >= 0 ||
      KWINCONFIG.ignoreClass.indexOf(resourceName) >= 0 ||
      matchWords(this.window.caption, KWINCONFIG.ignoreTitle) >= 0 ||
      KWINCONFIG.ignoreRole.indexOf(windowRole) >= 0
    );
  }

  public get shouldFloat(): boolean {
    const resourceClass = String(this.window.resourceClass);
    const resourceName = String(this.window.resourceName);
    const moreOneDesktop = this.window.desktops.length !== 1;
    return (
      moreOneDesktop ||
      this.window.onAllDesktops ||
      this.window.modal ||
      this.window.transient ||
      !this.window.resizeable ||
      (KWINCONFIG.floatUtility &&
        (this.window.dialog || this.window.splash || this.window.utility)) ||
      KWINCONFIG.floatingClass.indexOf(resourceClass) >= 0 ||
      KWINCONFIG.floatingClass.indexOf(resourceName) >= 0 ||
      matchWords(this.window.caption, KWINCONFIG.floatingTitle) >= 0
    );
  }

  public maximized: boolean;

  public get surface(): ISurface {
    let activity;
    if (this.window.activities.length === 0)
      activity = this.workspace.currentActivity;
    else if (
      this.window.activities.indexOf(this.workspace.currentActivity) >= 0
    )
      activity = this.workspace.currentActivity;
    else activity = this.window.activities[0];

    const desktop = this.window.desktops[0];

    return new KWinSurface(
      this.window.output,
      activity,
      desktop,
      this.workspace
    );
  }

  public set surface(srf: ISurface) {
    const ksrf = srf as KWinSurface;

    // TODO: setting activity?
    // TODO: setting screen = move to the screen
    if (this.window.desktops[0] !== ksrf.desktop)
      this.window.desktops = [ksrf.desktop];
    if (this.window.activities[0] !== ksrf.activity)
      this.window.activities = [ksrf.activity];
  }

  private noBorderManaged: boolean;
  private noBorderOriginal: boolean;

  constructor(window: Window, workspace: Workspace) {
    this.workspace = workspace;
    this.window = window;
    this.id = KWinWindow.generateID(window);
    this.maximized = false;
    this.noBorderManaged = false;
    this.noBorderOriginal = window.noBorder;
  }

  public commit(geometry?: Rect, noBorder?: boolean, keepAbove?: boolean) {
    debugObj(() => ["KWinWindow#commit", { geometry, noBorder, keepAbove }]);
    if (this.window.move || this.window.resize) return;

    if (noBorder !== undefined) {
      if (!this.noBorderManaged && noBorder)
        /* Backup border state when transitioning from unmanaged to managed */
        this.noBorderOriginal = this.window.noBorder;
      else if (this.noBorderManaged && !this.window.noBorder)
        /* If border is enabled while in managed mode, remember it.
         * Note that there's no way to know if border is re-disabled in managed mode. */
        this.noBorderOriginal = false;

      if (noBorder)
        /* (Re)entering managed mode: remove border. */
        this.window.noBorder = true;
      else if (this.noBorderManaged)
        /* Exiting managed mode: restore original value. */
        this.window.noBorder = this.noBorderOriginal;

      /* update mode */
      this.noBorderManaged = noBorder;
    }

    if (keepAbove !== undefined) this.window.keepAbove = keepAbove;

    if (geometry !== undefined) {
      geometry = this.adjustGeometry(geometry);
      if (KWINCONFIG.preventProtrusion) {
        const area = toRect(
          this.workspace.clientArea(
            ClientAreaOption.PlacementArea,
            this.window.output,
            this.workspace.currentDesktop
          )
        );
        if (!area.includes(geometry)) {
          /* assume windows will extrude only through right and bottom edges */
          const x = geometry.x + Math.min(area.maxX - geometry.maxX, 0);
          const y = geometry.y + Math.min(area.maxY - geometry.maxY, 0);
          geometry = new Rect(x, y, geometry.width, geometry.height);
          geometry = this.adjustGeometry(geometry);
        }
      }
      if (this.window.deleted) return;
      this.window.frameGeometry = toQRect(geometry);
    }
  }

  public toString(): string {
    /* using a shorthand name to keep debug message tidy */
    return (
      "KWin(" +
      this.window.internalId.toString() +
      "." +
      this.window.resourceClass +
      ")"
    );
  }

  public visible(srf: ISurface): boolean {
    const ksrf = srf as KWinSurface;
    return (
      !this.window.deleted &&
      !this.window.minimized &&
      (this.window.onAllDesktops ||
        this.window.desktops.indexOf(ksrf.desktop) !== -1) &&
      (this.window.activities.length === 0 /* on all activities */ ||
        this.window.activities.indexOf(ksrf.activity) !== -1) &&
      this.window.output === ksrf.output
    );
  }

  //#region Private Methods

  /** apply various resize hints to the given geometry */
  private adjustGeometry(geometry: Rect): Rect {
    let width = geometry.width;
    let height = geometry.height;

    /* do not resize fixed-size windows */
    if (!this.window.resizeable) {
      width = this.window.width;
      height = this.window.height;
    } else {
      /* respect resize increment */
      // if (
      //   !(
      //     this.window.basicUnit.width === 1 &&
      //     this.window.basicUnit.height === 1
      //   )
      // )
      //   /* NOT free-size */
      //   [width, height] = this.applyResizeIncrement(geometry);

      /* respect min/max size limit */
      width = clip(width, this.window.minSize.width, this.window.maxSize.width);
      height = clip(
        height,
        this.window.minSize.height,
        this.window.maxSize.height
      );
    }

    return new Rect(geometry.x, geometry.y, width, height);
  }

  // private applyResizeIncrement(geom: Rect): [number, number] {
  //   const unit = this.window.basicUnit;
  //   const base = this.window.minSize;
  //
  //   const padWidth = this.window.geometry.width - this.window.clientSize.width;
  //   const padHeight =
  //     this.window.geometry.height - this.window.clientSize.height;
  //
  //   const quotWidth = Math.floor(
  //     (geom.width - base.width - padWidth) / unit.width
  //   );
  //   const quotHeight = Math.floor(
  //     (geom.height - base.height - padHeight) / unit.height
  //   );
  //
  //   const newWidth = base.width + unit.width * quotWidth + padWidth;
  //   const newHeight = base.height + unit.height * quotHeight + padHeight;
  //
  //   // debugObj(() => ["applyResizeIncrement", {
  //   //     // tslint:disable-next-line:object-literal-sort-keys
  //   //     unit, base, geom,
  //   //     pad: [padWidth, padHeight].join("x"),
  //   //     size: [newWidth, newHeight].join("x"),
  //   // }]);
  //
  //   return [newWidth, newHeight];
  // }

  //#endregion
}
