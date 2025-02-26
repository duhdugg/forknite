// Copyright (c) 2024 Vjatcheslav V. Kolchkov <akl334@protonmail.ch>
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

type positionType = "single" | "left" | "middle" | "right";

class ColumnLayout implements ILayout {
  public static readonly id = "Column";
  public readonly classID = ColumnLayout.id;
  public position: positionType;
  public windowIds: Set<string>;
  public renderedWindowsIds: Array<string>;
  public renderedWindowsRects: Array<Rect>;
  public weight: number;
  public timestamp: number;
  private parts: RotateLayoutPart<StackLayoutPart>;
  private numberFloatedOrMinimized: number;

  public get description(): string {
    return "Column";
  }

  public toString(): string {
    let s: string = `ColumnLayout${this.windowIds.size}:`;
    this.windowIds.forEach((id) => (s = s + id + ","));
    return s;
  }

  constructor() {
    this.position = "single";
    this.weight = 1.0;
    this.parts = new RotateLayoutPart(new StackLayoutPart());
    this.parts.inner.gap = CONFIG.tileLayoutGap;
    this.windowIds = new Set();
    this.renderedWindowsIds = [];
    this.renderedWindowsRects = [];
    this.numberFloatedOrMinimized = 0;
    this.timestamp = 0;
  }

  public get size(): number {
    return this.windowIds.size - this.numberFloatedOrMinimized;
  }

  public set isHorizontal(value: boolean) {
    if (value) this.parts.angle = 270;
    else this.parts.angle = 0;
  }

  public isEmpty(): boolean {
    return this.windowIds.size === this.numberFloatedOrMinimized;
  }

  public apply(ctx: EngineContext, tileables: WindowClass[], area: Rect): void {
    this.renderedWindowsIds = [];
    // this.correctArea(area);
    let columnTileables = tileables.filter((w) => {
      if (this.windowIds.has(w.id)) {
        this.renderedWindowsIds.push(w.id);
        return true;
      }
    });
    this.renderedWindowsRects = [];
    this.parts.apply(area, columnTileables).forEach((geometry, i) => {
      columnTileables[i].geometry = geometry;
      this.renderedWindowsRects.push(geometry);
    });
  }

  public getUpperWindowId(id: string): string | null {
    let winId = this.renderedWindowsIds.indexOf(id);
    if (winId < 1) return null;
    return this.renderedWindowsIds[winId - 1];
  }

  public getLowerWindowId(id: string): string | null {
    let winId = this.renderedWindowsIds.indexOf(id);
    if (winId < 0 || winId === this.renderedWindowsIds.length - 1) return null;
    return this.renderedWindowsIds[winId + 1];
  }

  public getWindowIdOnRight(x: number): string | null {
    for (let i = 0; i < this.renderedWindowsIds.length; i++) {
      if (x < this.renderedWindowsRects[i].center[0] + 10)
        return this.renderedWindowsIds[i];
    }
    return null;
  }
  public getWindowIdOnTop(y: number): string | null {
    for (let i = 0; i < this.renderedWindowsIds.length; i++) {
      if (y < this.renderedWindowsRects[i].center[1] + 10)
        return this.renderedWindowsIds[i];
    }
    return null;
  }

  public adjust(
    area: Rect,
    tiles: WindowClass[],
    basis: WindowClass,
    delta: RectDelta
  ) {
    let columnTiles = tiles.filter((t) => this.windowIds.has(t.id));
    this.parts.adjust(area, columnTiles, basis, delta);
  }

  public actualizeWindowIds(ctx: EngineContext, ids: Set<string>) {
    let window: WindowClass | null;
    let floatedOrMinimized: number = 0;
    // Sets intersection
    this.windowIds = new Set(
      [...this.windowIds].filter((id) => {
        window = ctx.getWindowById(id);
        if (ids.has(id)) return true;
        else if (window !== null && (window.minimized || window.floating)) {
          floatedOrMinimized += 1;
          return true;
        }
        return false;
      })
    );
    this.numberFloatedOrMinimized = floatedOrMinimized;
  }
}
