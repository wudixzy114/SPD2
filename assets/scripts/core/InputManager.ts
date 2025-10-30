import {
  _decorator,
  Component,
  Node,
  Input,
  input,
  EventKeyboard,
  KeyCode,
  Vec2,
} from "cc";
import { EventManager } from "./EventManager";
import { GameEvent } from "../common/GameEvent";
const { ccclass, property } = _decorator;

@ccclass("InputManager")
export class InputManager extends Component {
  protected onEnable(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
  protected onDisable(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private onKeyDown(event: EventKeyboard) {
    let direction: Vec2 | null = null;
    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        direction = new Vec2(0, 1); // North
        break;
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        direction = new Vec2(0, -1); // South
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        direction = new Vec2(-1, 0); // West
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        direction = new Vec2(1, 0); // East
        break;
      case KeyCode.SPACE:
        EventManager.instance.emit(GameEvent.INPUT_WAIT_INTENT);
        break;
    }

    if (direction) {
      EventManager.instance.emit(GameEvent.INPUT_MOVE_INTENT, direction);
    }
  }
}
