// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// Copyright (c) 2024 Doug Elkin <doug@dougelkin.com>
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
class WindowStore {
  public list: WindowClass[];

  constructor(windows?: WindowClass[]) {
    this.list = windows || [];
  }

  public move(srcWin: WindowClass, destWin: WindowClass, after?: boolean) {
    const srcIdx = this.list.indexOf(srcWin);
    const destIdx = this.list.indexOf(destWin);
    if (srcIdx === -1 || destIdx === -1) return;

    this.list.splice(srcIdx, 1);
    this.list.splice(after ? destIdx + 1 : destIdx, 0, srcWin);
  }

  public setMaster(window: WindowClass) {
    const idx = this.list.indexOf(window);
    if (idx === -1) return;
    this.list.splice(idx, 1);
    this.list.splice(0, 0, window);
  }

  public swap(alpha: WindowClass, beta: WindowClass) {
    const alphaIndex = this.list.indexOf(alpha);
    const betaIndex = this.list.indexOf(beta);
    if (alphaIndex < 0 || betaIndex < 0) return;

    this.list[alphaIndex] = beta;
    this.list[betaIndex] = alpha;
  }

  //#region Storage Operation

  public get length(): number {
    return this.list.length;
  }

  public at(idx: number) {
    return this.list[idx];
  }

  public indexOf(window: WindowClass) {
    return this.list.indexOf(window);
  }

  public push(window: WindowClass) {
    this.list.push(window);
  }

  public beside_first(window: WindowClass) {
    this.list.splice(1, 0, window);
  }

  public relative_state(window: WindowClass) {
    this.list.splice(this.getLastFocusedIndex(window), 0, window);
  }

  public getLastFocusedIndex(window: WindowClass): number {
    const lastFocused = window.driver.control.lastFocused;
    if (lastFocused === null) {
      return 0;
    }
    const idx = this.indexOf(lastFocused);
    return idx >= 0 ? idx : 0;
  }

  public remove(window: WindowClass) {
    const idx = this.list.indexOf(window);
    if (idx >= 0) this.list.splice(idx, 1);
  }

  public unshift(window: WindowClass) {
    this.list.unshift(window);
  }
  //#endregion

  //#region Querying Windows

  /** Returns all visible windows on the given surface. */
  public getVisibleWindows(srf: ISurface): WindowClass[] {
    return this.list.filter((win) => win.visible(srf));
  }

  /** Return all visible "Tile" windows on the given surface. */
  public getVisibleTiles(srf: ISurface): WindowClass[] {
    return this.list.filter((win) => win.tiled && win.visible(srf));
  }

  /**
   * Return all visible "tileable" windows on the given surface
   * @see WindowClass#tileable
   */
  public getVisibleTileables(srf: ISurface): WindowClass[] {
    return this.list.filter((win) => win.tileable && win.visible(srf));
  }

  //#endregion
}
