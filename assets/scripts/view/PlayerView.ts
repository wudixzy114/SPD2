import {
  _decorator,
  Component,
  Node,
  Sprite,
  UITransform,
  Color,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerView")
export class PlayerView extends Component {
  public initialize(): void {
    let sprite = this.getComponent(Sprite);
    if (!sprite) {
      sprite = this.addComponent(Sprite);
    }

    const uiTramsform = this.addComponent(UITransform);
    uiTramsform.setContentSize(32, 32);
    sprite.color = Color.YELLOW;
  }

  public updatePosition(worldPosition: Vec3): void {
    this.node.setWorldPosition(worldPosition);
  }
}
