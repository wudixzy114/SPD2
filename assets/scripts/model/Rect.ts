import { _decorator, Vec2, Size } from "cc";

export class Rect {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + width;
    this.y2 = y + height;
  }

  public get center(): Vec2 {
    const centerX = Math.floor((this.x1 + this.x2) / 2);
    const centerY = Math.floor((this.y1 + this.y2) / 2);
    return new Vec2(centerX, centerY);
  }

  public intersects(other: Rect): boolean {
    return (
      this.x1 <= other.x2 &&
      this.x2 >= other.x1 &&
      this.y1 <= other.y2 &&
      this.y2 >= other.y1
    );
  }
}
