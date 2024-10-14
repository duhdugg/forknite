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

class ColumnsLayout implements ILayout {
  public static readonly id = "Columns";
  public parts: ColumnLayout[];
  public readonly classID = ColumnsLayout.id;
  private direction: windRose;

  public get description(): string {
    return "Columns";
  }

  constructor() {
    this.parts = [new ColumnLayout()];
    this.direction = new windRose(CONFIG.columnsLayoutInitialAngle);
  }
  public adjust(
    area: Rect,
    tiles: WindowClass[],
    basis: WindowClass,
    delta: RectDelta
  ) {
    let columnId = this.getColumnId(basis);
    if (columnId === null) return;
    let isReverse = this.direction.east || this.direction.south;
    let columnsLength = this.parts.length;
    // column resize
    if (
      ((this.direction.east || this.direction.west) &&
        (delta.east !== 0 || delta.west !== 0)) ||
      ((this.direction.north || this.direction.south) &&
        (delta.north !== 0 || delta.south !== 0))
    ) {
      let oldWeights: Array<number>;
      if (isReverse) {
        oldWeights = this.parts
          .slice(0)
          .reverse()
          .map((column) => column.weight);
      } else {
        oldWeights = this.parts.map((column) => column.weight);
      }
      const weights = LayoutUtils.adjustAreaWeights(
        area,
        oldWeights,
        CONFIG.tileLayoutGap,
        isReverse ? columnsLength - 1 - columnId : columnId,
        delta,
        this.direction.east || this.direction.west
      );

      weights.forEach((weight, i) => {
        this.parts[isReverse ? columnsLength - 1 - i : i].weight =
          weight * columnsLength;
      });
    }
    if (
      ((delta.north !== 0 || delta.south !== 0) &&
        (this.direction.east || this.direction.west)) ||
      ((delta.east !== 0 || delta.west !== 0) &&
        (this.direction.north || this.direction.south))
    ) {
      this.parts[columnId].adjust(area, tiles, basis, delta);
    }
  }

  public apply(ctx: EngineContext, tileables: WindowClass[], area: Rect): void {
    print(`columnsApply: ${this.direction}`);
    this.arrangeTileables(tileables);
    let weights: Array<number>;
    if (this.direction.east || this.direction.south) {
      weights = this.parts
        .slice(0)
        .reverse()
        .map((tile) => tile.weight);
    } else {
      weights = this.parts.map((tile) => tile.weight);
    }
    const rects = LayoutUtils.splitAreaWeighted(
      area,
      weights,
      CONFIG.tileLayoutGap,
      this.direction.east || this.direction.west
    );
    if (this.direction.east || this.direction.south) {
      let i = 0;
      for (var idx = this.parts.length - 1; idx >= 0; idx--) {
        this.parts[idx].isHorizontal = this.direction.south;
        this.parts[idx].apply(ctx, tileables, rects[i]);
        i++;
      }
    } else {
      for (var idx = 0; idx < this.parts.length; idx++) {
        this.parts[idx].isHorizontal = this.direction.north;
        this.parts[idx].apply(ctx, tileables, rects[idx]);
      }
    }
  }

  public drag(
    ctx: EngineContext,
    activationPoint: [number, number],
    window: WindowClass,
    workingArea: Rect
  ): boolean {
    if (this.parts.length === 1 && this.parts[0].windowIds.size === 1)
      return false;
    let columnId = this.getColumnId(window);
    let windowId = window.id;
    if (
      ((this.direction.north && workingArea.isTopZone(activationPoint)) ||
        (this.direction.south && workingArea.isBottomZone(activationPoint)) ||
        (this.direction.west && workingArea.isLeftZone(activationPoint)) ||
        (this.direction.east && workingArea.isRightZone(activationPoint))) &&
      !(
        this.parts[0].windowIds.size === 1 &&
        this.parts[0].windowIds.has(windowId)
      )
    ) {
      if (columnId !== null) this.parts[columnId].windowIds.delete(windowId);
      this.insertColumn(0);
      this.parts[0].windowIds.add(windowId);
      return true;
    }
    if (
      ((this.direction.north && workingArea.isBottomZone(activationPoint)) ||
        (this.direction.south && workingArea.isTopZone(activationPoint)) ||
        (this.direction.west && workingArea.isRightZone(activationPoint)) ||
        (this.direction.east && workingArea.isLeftZone(activationPoint))) &&
      !(
        this.parts[this.parts.length - 1].windowIds.size === 1 &&
        this.parts[this.parts.length - 1].windowIds.has(windowId)
      )
    ) {
      if (columnId !== null) this.parts[columnId].windowIds.delete(windowId);
      this.insertColumn(this.parts.length);
      this.parts[this.parts.length - 1].windowIds.add(windowId);
      return true;
    }
    for (let colIdx = 0; colIdx < this.parts.length; colIdx++) {
      const column = this.parts[colIdx];
      for (let i = 0; i < column.renderedWindowsRects.length; i++) {
        const renderedRect = column.renderedWindowsRects[i];
        if (
          (this.direction.west &&
            renderedRect.includesPoint(activationPoint, RectParts.Top)) ||
          (this.direction.north &&
            renderedRect.includesPoint(activationPoint, RectParts.Left)) ||
          (this.direction.east &&
            renderedRect.includesPoint(activationPoint, RectParts.Top)) ||
          (this.direction.south &&
            renderedRect.includesPoint(activationPoint, RectParts.Left))
        ) {
          if (column.renderedWindowsIds[i] === windowId) return false;
          if (i > 0 && column.renderedWindowsIds[i - 1] === windowId)
            return false;

          const renderedId = column.renderedWindowsIds[i];
          if (columnId !== null && columnId !== colIdx)
            this.parts[columnId].windowIds.delete(windowId);
          column.windowIds.add(windowId);
          ctx.moveWindowByWinId(window, renderedId);
          return true;
        }
        if (
          (this.direction.west &&
            renderedRect.includesPoint(activationPoint, RectParts.Bottom)) ||
          (this.direction.north &&
            renderedRect.includesPoint(activationPoint, RectParts.Right)) ||
          (this.direction.east &&
            renderedRect.includesPoint(activationPoint, RectParts.Bottom)) ||
          (this.direction.south &&
            renderedRect.includesPoint(activationPoint, RectParts.Right))
        ) {
          if (column.renderedWindowsIds[i] === windowId) return false;
          if (
            i < column.renderedWindowsIds.length - 1 &&
            column.renderedWindowsIds[i + 1] === windowId
          )
            return false;

          const renderedId = column.renderedWindowsIds[i];
          if (columnId !== null && columnId !== colIdx)
            this.parts[columnId].windowIds.delete(windowId);
          column.windowIds.add(windowId);
          ctx.moveWindowByWinId(window, renderedId, true);
          return true;
        }
      }
    }
    return false;
  }

  private arrangeTileables(tileables: WindowClass[]) {
    let latestTimestamp: number = 0;
    let columnId: number | null = null;
    let newWindows: Set<string> = new Set();
    let tileableIds: Set<string> = new Set();
    let currentColumnId: number = 0;

    tileables.forEach((tileable) => {
      tileable.state = WindowState.Tiled;
      columnId = this.getColumnId(tileable);

      if (columnId !== null) {
        if (tileable.timestamp > latestTimestamp) {
          latestTimestamp = tileable.timestamp;
          currentColumnId = columnId;
        }
      } else {
        newWindows.add(tileable.id);
      }
      tileableIds.add(tileable.id);
    });

    this.parts[currentColumnId].windowIds = new Set([
      ...this.parts[currentColumnId].windowIds,
      ...newWindows,
    ]);

    this.parts.forEach((column) => {
      column.actualizeWindowIds(tileableIds);
    });
    this.parts = this.parts.filter((column) => column.windowIds.size !== 0);
    if (this.parts.length === 0) this.parts.push(new ColumnLayout());
    this.applyColumnsPosition();
  }
  private getColumnId(t: WindowClass): number | null {
    for (var i = 0; i < this.parts.length; i++) {
      if (this.parts[i].windowIds.has(t.id)) return i;
    }
    return null;
  }
  private getCurrentWinId(ctx: EngineContext): string | null {
    return ctx.currentWindow === null ? null : ctx.currentWindow.id;
  }
  private getCurrentColumnIdx(currentWindowId: string | null): number | null {
    if (currentWindowId !== null) {
      for (const [i, column] of this.parts.entries()) {
        if (column.windowIds.has(currentWindowId)) return i;
      }
    }
    return null;
  }
  private applyColumnsPosition() {
    const length = this.parts.length;
    if (length === 1) {
      this.parts[0].position = "single";
    } else if (length > 1) {
      this.parts[0].position = "left";
      this.parts[length - 1].position = "right";
      for (let i = 1; i < length - 1; i++) {
        this.parts[i].position = "middle";
      }
    }
  }

  private toColumnWithBiggerIndex(ctx: EngineContext) {
    let currentWindowId = this.getCurrentWinId(ctx);
    let activeColumnId = this.getCurrentColumnIdx(currentWindowId);
    if (
      currentWindowId === null ||
      activeColumnId === null ||
      (this.parts[activeColumnId].windowIds.size < 2 &&
        (this.parts[activeColumnId].position === "right" ||
          this.parts[activeColumnId].position === "single"))
    )
      return;
    if (
      this.parts[activeColumnId].position === "single" ||
      this.parts[activeColumnId].position === "right"
    ) {
      this.insertColumn(this.parts.length);
    }

    this.parts[activeColumnId].windowIds.delete(currentWindowId);
    this.parts[activeColumnId + 1].windowIds.add(currentWindowId);
  }
  private toColumnWithSmallerIndex(ctx: EngineContext) {
    let currentWindowId = this.getCurrentWinId(ctx);
    let activeColumnId = this.getCurrentColumnIdx(currentWindowId);

    if (
      currentWindowId === null ||
      activeColumnId === null ||
      (this.parts[activeColumnId].windowIds.size < 2 &&
        (this.parts[activeColumnId].position === "left" ||
          this.parts[activeColumnId].position === "single"))
    )
      return;
    if (
      this.parts[activeColumnId].position === "single" ||
      this.parts[activeColumnId].position === "left"
    ) {
      this.insertColumn(0);
      this.parts[1].windowIds.delete(currentWindowId);
      this.parts[0].windowIds.add(currentWindowId);
    } else {
      this.parts[activeColumnId].windowIds.delete(currentWindowId);
      this.parts[activeColumnId - 1].windowIds.add(currentWindowId);
    }
  }
  private toUpOrLeft(ctx: EngineContext) {
    let currentWindow = ctx.currentWindow;
    let currentWindowId = currentWindow !== null ? currentWindow.id : null;
    let activeColumnId = this.getCurrentColumnIdx(currentWindowId);

    if (
      currentWindow === null ||
      currentWindowId === null ||
      activeColumnId === null ||
      this.parts[activeColumnId].windowIds.size < 2
    )
      return;
    let upperWinId =
      this.parts[activeColumnId].getUpperWindowId(currentWindowId);
    if (upperWinId === null) return;
    ctx.moveWindowByWinId(currentWindow, upperWinId);
  }
  private toBottomOrRight(ctx: EngineContext) {
    let currentWindow = ctx.currentWindow;
    let currentWindowId = currentWindow !== null ? currentWindow.id : null;
    let activeColumnId = this.getCurrentColumnIdx(currentWindowId);

    if (
      currentWindow === null ||
      currentWindowId === null ||
      activeColumnId === null ||
      this.parts[activeColumnId].windowIds.size < 2
    )
      return;
    let lowerWinId =
      this.parts[activeColumnId].getLowerWindowId(currentWindowId);
    if (lowerWinId === null) return;
    ctx.moveWindowByWinId(currentWindow, lowerWinId, true);
  }
  public handleShortcut(ctx: EngineContext, input: Shortcut) {
    switch (input) {
      case Shortcut.SwapLeft:
        if (this.direction.north || this.direction.south) {
          this.toUpOrLeft(ctx);
        } else if (this.direction.east) {
          this.toColumnWithBiggerIndex(ctx);
        } else this.toColumnWithSmallerIndex(ctx);
        break;
      case Shortcut.SwapRight:
        if (this.direction.north || this.direction.south) {
          this.toBottomOrRight(ctx);
        } else if (this.direction.east) {
          this.toColumnWithSmallerIndex(ctx);
        } else this.toColumnWithBiggerIndex(ctx);
        break;
      case Shortcut.SwapUp:
        if (this.direction.north) {
          this.toColumnWithSmallerIndex(ctx);
        } else if (this.direction.south) {
          this.toColumnWithBiggerIndex(ctx);
        } else this.toUpOrLeft(ctx);
        break;
      case Shortcut.SwapDown:
        if (this.direction.north) {
          this.toColumnWithBiggerIndex(ctx);
        } else if (this.direction.south) {
          print("hello");
          this.toColumnWithSmallerIndex(ctx);
        } else this.toBottomOrRight(ctx);
        break;
      case Shortcut.Rotate:
        this.direction.cwRotation();
        print(
          `cwRotation: north:${this.direction.north},east:${this.direction.east},south:${this.direction.south},west:${this.direction.west}`
        );
        break;
      case Shortcut.RotatePart:
        this.direction.ccwRotation();
        print(
          `ccwRotation: north:${this.direction.north},east:${this.direction.east},south:${this.direction.south},west:${this.direction.west}`
        );
        break;

      default:
        return false;
    }
    return true;
  }
  private insertColumn(index: number) {
    this.parts.splice(index, 0, new ColumnLayout());
    this.applyColumnsPosition();
  }
}
