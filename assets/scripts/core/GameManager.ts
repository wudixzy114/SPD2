import { _decorator, Component, director, game, Vec2 } from "cc";
import { EventManager } from "./EventManager";
import { GameEvent } from "../common/GameEvent";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
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
}
