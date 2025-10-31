import {
  _decorator,
  Component,
  Node,
  TiledLayer,
  TiledMap,
  resources,
  TiledMapAsset,
  Vec2,
  UITransform,
  Vec3,
  Size,
} from "cc";
import { Level } from "../model/Level";
import { TileType } from "../model/Tile";
const { ccclass, property } = _decorator;

@ccclass("DungeonView")
export class DungeonView extends Component {
  @property(TiledMap)
  private tiledMap: TiledMap = null;

  private layer: TiledLayer = null;
  private tileSize: Size;

  public async initialize(level: Level): Promise<void> {
    if (!this.tiledMap) {
      console.error("TiledMap component is not assigned in DungeonView.");
      return;
    }

    this.layer = this.tiledMap.getLayer("ground");
    if (!this.layer) {
      console.error("Failed to find 'ground' layer in TiledMap.");
      return;
    }

    const mapSize = this.tiledMap.getMapSize();
    if (mapSize.width < level.width || mapSize.height < level.height) {
      console.warn(
        "Map size is smaller than level dimensions. The map might not render completely."
      );
    }

    this.tileSize = this.tiledMap.getTileSize();

    this.renderLevel(level);
  }

  public worldToTile(worldPos: Vec3): Vec2 {
    const uiTransform = this.tiledMap.node.getComponent(UITransform);
    const localPos = uiTransform.convertToNodeSpaceAR(worldPos);
    const tileX = Math.floor(localPos.x / this.tileSize.width);
    const tileY = Math.floor(localPos.y / this.tileSize.width);
    return new Vec2(tileX, tileY);
  }

  public tileToWorld(tilePos: Vec2): Vec3 {
    // 1. Get the local position of the center of the tile from the TiledLayer
    const localPos = this.layer.getPositionAt(tilePos.x, tilePos.y);

    // Correct the local position to be the center of the tile
    localPos.x += this.tileSize.width / 2;
    localPos.y += this.tileSize.height / 2;

    // 2. Convert this local position to world space
    const uiTransform = this.tiledMap.node.getComponent(UITransform);
    const worldPos = uiTransform.convertToWorldSpaceAR(
      new Vec3(localPos.x, localPos.y, 0)
    );

    return worldPos;
  }

  private renderLevel(level: Level): void {
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const tileData = level.getTile(x, y);
        if (tileData) {
          const gid =
            tileData.type === TileType.Wall
              ? 1
              : tileData.type === TileType.Floor
              ? 2
              : 0;
          this.layer.setTileGIDAt(gid, x, y);
        } else {
          this.layer.setTileGIDAt(0, x, y);
        }
      }
    }
  }
}
