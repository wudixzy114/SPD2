import { _decorator, Vec2, VERSION } from "cc";
import { Tile } from "./Tile";

export class Level {
  public readonly width: number;
  public readonly height: number;
  public tiles: Map<string, Tile>;
  public startPosition: Vec2;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = new Map<string, Tile>();
    this.startPosition = new Vec2(0, 0);
  }

  public getTile(x: number, y: number): Tile | undefined {
    return this.tiles.get(`${x},${y}`);
  }

  public setTile(tile: Tile): void {
    this.tiles.set(`${tile.position.x},${tile.position.y}`, tile);
  }
}
