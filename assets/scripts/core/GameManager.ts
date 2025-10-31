import {
  _decorator,
  Component,
  director,
  game,
  Vec2,
  find,
  instantiate,
  Prefab,
  Camera,
  Vec3,
} from "cc";
import { EventManager } from "./EventManager";
import { GameEvent } from "../common/GameEvent";
import { DungeonGenerator } from "../logic/DungeonGenerator";
import { Level } from "../model/Level";
import { TileType } from "../model/Tile";
import { DungeonView } from "../view/DungeonView";
import { PlayerView } from "../view/PlayerView";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Prefab)
  private playerPrefab: Prefab = null;

  private currentLevel: Level;
  private dungeonView: DungeonView;
  private playerView: PlayerView;
  private mainCamera: Camera;

  async onLoad() {
    director.addPersistRootNode(this.node);

    const dungeonNode = find("Dungeon");
    if (
      !dungeonNode ||
      !(this.dungeonView = dungeonNode.getComponent(DungeonView))
    ) {
      console.error(
        "Dungeon node or DungeonView component not found in the scene."
      );
      return;
    }

    this.mainCamera = find("Camera").getComponent(Camera);

    EventManager.instance.on(
      GameEvent.INPUT_MOVE_INTENT,
      this.onPlayerMoveIntent,
      this
    );
    EventManager.instance.on(
      GameEvent.INPUT_WAIT_INTENT,
      this.onPlayerWaitIntent,
      this
    );
  }

  protected onDestroy(): void {
    EventManager.instance.off(
      GameEvent.INPUT_MOVE_INTENT,
      this.onPlayerMoveIntent,
      this
    );
    EventManager.instance.off(
      GameEvent.INPUT_WAIT_INTENT,
      this.onPlayerWaitIntent,
      this
    );
  }

  protected start() {
    console.log("Game architecture initialized. Waiting for input...");
    this.createNewLevel();
    this.spawnPlayer();
    EventManager.instance.emit(GameEvent.GAME_START);
  }

  private createNewLevel(): void {
    const generator = new DungeonGenerator();
    this.currentLevel = generator.generate(80, 50, 15, 6, 10);
    this.dungeonView.initialize(this.currentLevel);
  }

  private spawnPlayer(): void {
    const playerNode = instantiate(this.playerPrefab);
    this.playerView = playerNode.getComponent(PlayerView);
    this.playerView.initialize();

    const dungeonNode = find("Dungeon");
    dungeonNode.addChild(playerNode);

    const startWorldPos = this.dungeonView.tileToWorld(
      this.currentLevel.startPosition
    );
    this.playerView.updatePosition(startWorldPos);
    this.centerCameraOnPlayer();
  }

  private centerCameraOnPlayer(): void {
    if (this.playerView && this.mainCamera) {
      const playerPos = this.playerView.node.worldPosition;
      this.mainCamera.node.setWorldPosition(
        new Vec3(playerPos.x, playerPos.y, this.mainCamera.node.worldPosition.z)
      );
    }
  }

  private onPlayerMoveIntent(direction: Vec2) {
    // --- THIS IS TEMPORARY LOGIC FOR VISUAL TESTING ---
    const newPos = this.currentLevel.startPosition.clone().add(direction);

    // Simple boundary and wall check
    const targetTile = this.currentLevel.getTile(newPos.x, newPos.y);
    if (targetTile && targetTile.type !== TileType.Wall) {
      this.currentLevel.startPosition = newPos;
      const newWorldPos = this.dungeonView.tileToWorld(
        this.currentLevel.startPosition
      );
      this.playerView.updatePosition(newWorldPos);
      this.centerCameraOnPlayer();
    }
    console.log(
      `[GameManager] Received move intent: (${direction.x}, ${direction.y})`
    );
    // Future logic for player action will be here
  }

  private onPlayerWaitIntent() {
    console.log(`[GameManager] Received wait intent.`);
    // Future logic for player wait action will be here
  }

  private generateAndPrintDungeon(): void {
    const generator = new DungeonGenerator();
    this.currentLevel = generator.generate(80, 50, 15, 6, 10);

    console.log(
      "Dungeon generated. Player start at:",
      this.currentLevel.startPosition
    );
    this.printDungeonToConsole();
  }

  private printDungeonToConsole(): void {
    let output = "";
    for (let y = 0; y < this.currentLevel.height; y++) {
      let row = "";
      for (let x = 0; x < this.currentLevel.width; x++) {
        const tile = this.currentLevel.getTile(x, y);
        switch (tile.type) {
          case TileType.Floor:
            row += ".";
            break;
          case TileType.Wall:
            row += "#";
            break;
          default:
            row += " ";
            break;
        }
      }
      output += row + "\n";
    }
    console.log(output);
  }
}
