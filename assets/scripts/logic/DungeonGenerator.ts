import { _decorator, Component, Node, randomRangeInt } from "cc";
import { Level } from "../model/Level";
import { Rect } from "../model/Rect";
import { Tile, TileType } from "../model/Tile";

export class DungeonGenerator {
  private level: Level;
  private rooms: Rect[] = [];

  public generate(
    width: number,
    height: number,
    maxRooms: number,
    minRoomSize: number,
    maxRoomSize: number
  ): Level {
    this.level = new Level(width, height);
    this.rooms = [];

    this.fillWithWalls();

    for (let i = 0; i < maxRooms; i++) {
      const roomWidth = randomRangeInt(minRoomSize, maxRoomSize);
      const roomHeight = randomRangeInt(minRoomSize, maxRoomSize);

      const x = randomRangeInt(0, width - roomWidth - 1);
      const y = randomRangeInt(0, height - roomHeight - 1);

      const newRoom = new Rect(x, y, roomWidth, roomHeight);

      let intersects = false;
      for (const otherRoom of this.rooms) {
        if (newRoom.intersects(otherRoom)) {
          intersects = true;
          break;
        }
      }

      if (!intersects) {
        this.createRoom(newRoom);

        if (this.rooms.length > 0) {
          const prevRoom = this.rooms[this.rooms.length - 1];
          this.connectRooms(prevRoom, newRoom);
        }

        this.rooms.push(newRoom);
      }
    }

    if (this.rooms.length > 0) {
      this.level.startPosition = this.rooms[0].center.clone();
    }

    return this.level;
  }

  private fillWithWalls(): void {
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        this.level.setTile(new Tile(x, y, TileType.Wall));
      }
    }
  }

  private createRoom(room: Rect): void {
    for (let y = room.y1 + 1; y < room.y2; y++) {
      for (let x = room.x1 + 1; x < room.x2; x++) {
        this.level.setTile(new Tile(x, y, TileType.Floor));
      }
    }
  }

  private connectRooms(roomA: Rect, roomB: Rect): void {
    const centerA = roomA.center;
    const centerB = roomB.center;

    if (Math.random() > 0.5) {
      // Horizontal tunnel first, then vertical
      this.createHorizontalTunnel(centerA.x, centerB.x, centerA.y);
      this.createVerticalTunnel(centerA.y, centerB.y, centerB.x);
    } else {
      // Vertical tunnel first, then horizontal
      this.createVerticalTunnel(centerA.y, centerB.y, centerA.x);
      this.createHorizontalTunnel(centerA.x, centerB.x, centerB.y);
    }
  }

  private createHorizontalTunnel(x1: number, x2: number, y: number): void {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      this.level.getTile(x, y).type = TileType.Floor;
    }
  }

  private createVerticalTunnel(y1: number, y2: number, x: number): void {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      this.level.getTile(x, y).type = TileType.Floor;
    }
  }
}
