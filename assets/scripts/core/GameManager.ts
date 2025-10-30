import { _decorator, Component, director, game, Vec2 } from "cc";
import { EventManager } from "./EventManager";
import { GameEvent } from "../common/GameEvent";
import { DungeonGenerator } from "../logic/DungeonGenerator";
import { Level } from "../model/Level";
import { TileType } from "../model/Tile";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private currentLevel: Level;

  protected onLoad(): void {
    director.addPersistRootNode(this.node);

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

  protected start(): void {
    console.log("Game architecture initialized. Waiting for input...");
    this.generateAndPrintDungeon();
    EventManager.instance.emit(GameEvent.GAME_START);
  }

  private onPlayerMoveIntent(direction: Vec2) {
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
