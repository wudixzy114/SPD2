import { _decorator, Vec2 } from "cc";

export enum TileType {
  Unused,
  Floor,
  Wall,
  Door,
}

export class Tile {
  public readonly position: Vec2;
  public type: TileType;
  public isExplored: boolean;
  public isVisible: boolean;

  constructor(x: number, y: number, type: TileType = TileType.Unused) {
    this.position = new Vec2(x, y);
    this.type = type;
    this.isExplored = false;
    this.isVisible = false;
  }
}
