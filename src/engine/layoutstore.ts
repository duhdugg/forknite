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

class LayoutStoreEntry {
  public get currentLayout(): ILayout {
    return this.loadLayout(this.currentID);
  }

  private currentIndex: number | null;
  private currentID: string;
  private layouts: { [key: string]: ILayout };
  private previousID: string;

  constructor(output_name: string, desktop_name?: string) {
    let layouts_str = CONFIG.layoutOrder.map(
      (layout, i) => i + "." + layout + ", "
    );
    print(`Forknite: Screen(output):${output_name}, Desktop(name):${desktop_name}, layouts: ${layouts_str}`);
    this.currentIndex = 0;
    this.currentID = CONFIG.layoutOrder[0];

    CONFIG.screenDefaultLayout.some((entry) => {
      let cfg = entry.split(":");
      let cfg_output = cfg[0];
      let cfg_desktop = cfg.length == 2 ? undefined : cfg[1];
      let cfg_screen_id_str = cfg.length == 2 ? cfg[1] : cfg[2];
      let cfg_screen_id = parseInt(cfg_screen_id_str);

      if (
        (output_name === cfg_output || cfg_output === '') &&
        (desktop_name === cfg_desktop || cfg_desktop === undefined) &&
        cfg_screen_id >= 0 &&
        cfg_screen_id < CONFIG.layoutOrder.length
      ) {
        this.currentIndex = cfg_screen_id;
        this.currentID = CONFIG.layoutOrder[this.currentIndex];
        return true;
      }
    });

    this.layouts = {};
    this.previousID = this.currentID;

    this.loadLayout(this.currentID);
  }

  public cycleLayout(step: -1 | 1): ILayout {
    this.previousID = this.currentID;
    this.currentIndex =
      this.currentIndex !== null
        ? wrapIndex(this.currentIndex + step, CONFIG.layoutOrder.length)
        : 0;
    this.currentID = CONFIG.layoutOrder[this.currentIndex];
    return this.loadLayout(this.currentID);
  }

  public setLayout(targetID: string): ILayout {
    const targetLayout = this.loadLayout(targetID);
    if (
      targetLayout instanceof MonocleLayout &&
      this.currentLayout instanceof MonocleLayout
    ) {
      /* toggle Monocle "OFF" */
      this.currentID = this.previousID;
      this.previousID = targetID;
    } else if (this.currentID !== targetID) {
      this.previousID = this.currentID;
      this.currentID = targetID;
    }

    this.updateCurrentIndex();
    return targetLayout;
  }

  private updateCurrentIndex(): void {
    const idx = CONFIG.layoutOrder.indexOf(this.currentID);
    this.currentIndex = idx === -1 ? null : idx;
  }

  private loadLayout(ID: string): ILayout {
    let layout = this.layouts[ID];
    if (!layout) layout = this.layouts[ID] = CONFIG.layoutFactories[ID]();
    return layout;
  }
}

class LayoutStore {
  private store: { [key: string]: LayoutStoreEntry };

  constructor() {
    this.store = {};
  }

  public getCurrentLayout(srf: ISurface): ILayout {
    return srf.ignore
      ? FloatingLayout.instance
      : this.getEntry(srf.id).currentLayout;
  }

  public cycleLayout(srf: ISurface, step: 1 | -1): ILayout | null {
    if (srf.ignore) return null;
    return this.getEntry(srf.id).cycleLayout(step);
  }

  public setLayout(srf: ISurface, layoutClassID: string): ILayout | null {
    if (srf.ignore) return null;
    return this.getEntry(srf.id).setLayout(layoutClassID);
  }

  private getEntry(key: string): LayoutStoreEntry {
    if (!this.store[key]) {
      // key with activity format example: HDMI-A-1@f381c9cf-cb90-4ade-8b3f-24ae0002d366#Desktop 1
      // check if this surface but without activity already constructed.
      // surface create after desktop and constructor ran twice
      let i1 = key.indexOf("@");
      let i2 = key.indexOf("#");
      let key_without_activity = key.slice(0, i1 + 1) + key.slice(i2);
      if (i1 > 0 && i2 > 0 && i2 - i1 > 1 && this.store[key_without_activity]) {
        this.store[key] = this.store[key_without_activity];
        delete this.store[key_without_activity];
      } else {
        let output_name = key.slice(0, key.indexOf("@"));
        let desktop_name = i2 !== -1 ? key.slice(i2 + 1) : undefined;
        this.store[key] = new LayoutStoreEntry(output_name, desktop_name);
      }
    }
    return this.store[key];
  }
}
