# SPD2

> **Cocos Creator 3.8.7 + TypeScript 实现的 Roguelike 地牢生成器：分层架构 + 事件总线 + 经典 BSP-like 房间连接。**

## 项目定位 / 背景

`SPD2` 是一个用 **Cocos Creator 3.8.7** 编辑器搭建的 2D 俯视角 Roguelike 原型。代码全部用 TypeScript，按"core / model / logic / view / common"五层划分，组件之间通过 `EventManager` 全局事件总线通信（而不是直接互相 `getComponent`），目标是做出"能跑出第一版可探索地牢"的最小闭环：进入场景 → 生成地牢 → 玩家实体出现在第一个房间中央 → 等待输入 → 收到方向键 → 在不穿墙的前提下移动一格。

当前提交的 message 是"添加 Player 预制体和地图渲染系统"，说明项目处于"基础设施刚搭起来"阶段。`DungeonGenerator.generate(width, height, maxRooms, minRoomSize, maxRoomSize)` 已经在 `GameManager.start` 里跑通，输出一张 80×50 最多 15 个房间的地图，玩家可以移动但**回合制逻辑、怪物、战斗、物品都没接**。

## 仓库结构

```
SPD2/
├── package.json                # Cocos Creator 描述文件（uuid + creator.version: 3.8.7）
├── tsconfig.json
├── .creator/                   # Cocos 编辑器模板
├── settings/v2/packages/       # engine / builder / program 等面板配置
├── assets/
│   ├── prefabs/
│   │   └── Player.prefab       # 玩家预制体
│   ├── resources/
│   │   └── map/grass.tmx       # Tiled 导出的地图（备用，目前未使用）
│   ├── scenes/
│   │   └── test.scene          # 主场景
│   ├── scripts/                # TypeScript 源码（按层组织）
│   │   ├── common/
│   │   │   └── GameEvent.ts    # 事件名字符串常量
│   │   ├── core/
│   │   │   ├── EventManager.ts # 单例事件总线
│   │   │   ├── GameManager.ts  # 入口组件：建关卡、生玩家、相机跟随
│   │   │   └── InputManager.ts # 键盘输入 → emit 事件
│   │   ├── model/
│   │   │   ├── Level.ts        # 二维 Tile 数组 + startPosition
│   │   │   ├── Rect.ts         # 房间矩形 + center/intersects
│   │   │   └── Tile.ts         # 单格 + TileType 枚举
│   │   ├── logic/
│   │   │   └── DungeonGenerator.ts  # 经典房间+走廊算法
│   │   └── view/
│   │       ├── DungeonView.ts  # 把 Level 画到 Tilemap
│   │       └── PlayerView.ts   # 玩家视图（updatePosition 等）
│   └── textures/               # TX Tileset Grass / Stone Ground
└── tsconfig.json
```

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 引擎 | Cocos Creator | 3.8.7 |
| 主语言 | TypeScript | （继承 Cocos 默认 ~5.x） |
| 项目结构 | Cocos Asset / Scene / Prefab | 标准 CC 工作流 |
| 地图源 | Tiled `.tmx` | — |
| 渲染 | Cocos Tilemap + Sprite | — |
| 包管理 | Cocos 自带（无 npm） | — |

## 核心模块 / 特性

- **五层代码组织**（`assets/scripts/`）：
  - `common/`：放跨层常量。`GameEvent` 用字符串字面量集中所有事件名（`GAME_START` / `INPUT_MOVE_INTENT` / `INPUT_WAIT_INTENT` 等），避免魔法字符串满天飞。
  - `core/`：`EventManager` 是单例 `on/off/emit`；`GameManager` 是挂在场景上的入口组件；`InputManager` 把键盘翻译成 intent 事件。
  - `model/`：纯数据。`Tile` 含 `type: TileType`；`Level` 是 `width × height` 的二维 Tile 数组 + `startPosition: Vec2`；`Rect` 提供 `intersects` 判定。
  - `logic/`：纯算法。`DungeonGenerator.generate` 跑 ① 全填墙 → ② 随机尝试 N 个房间（不与已存在房间相交则创建）→ ③ 用 L 形走廊连接相邻房间 → ④ 第一个房间的 center 设为 `startPosition`。
  - `view/`：纯表现。`DungeonView.initialize(level)` 把数据转成可视瓦片；`PlayerView.initialize` / `updatePosition` 负责玩家节点的位姿。
- **事件总线解耦**（`EventManager`）：`InputManager` 只负责 `emit(INPUT_MOVE_INTENT, dir)`，不直接调 `GameManager`；`GameManager.onLoad` 里 `on(INPUT_MOVE_INTENT, this.onPlayerMoveIntent, this)`，销毁时再 `off`。这样换一套输入（比如改成手柄）不需要改 core。
- **房间生成算法**（`DungeonGenerator`）：经典 roguelike 套路。先全填 `TileType.Wall`；循环里随机选 `roomWidth/Height ∈ [minRoomSize, maxRoomSize)`、随机 `(x, y)` 顶到不能相交；通过则 `createRoom`（内部挖空为 `Floor`），并 `connectRooms` 上一间房到当前新房（随机先横后纵 / 先纵后横，用 `createHorizontalTunnel` / `createVerticalTunnel` 凿出 L 形走廊）。所有房间记到 `this.rooms[]`。
- **关卡状态**（`Level`）：`setTile / getTile` 是边界安全的访问器；`startPosition` 在生成后被赋值为 `rooms[0].center.clone()`。`GameManager` 每次新关都重新 `new DungeonGenerator().generate(80, 50, 15, 6, 10)`。
- **玩家控制**（`GameManager`）：`onPlayerMoveIntent(direction)` 是临时可视化版——直接在 `startPosition` 上加 direction，做边界和墙检测，通过则更新玩家位置并 `centerCameraOnPlayer`。`onPlayerWaitIntent` 仅 `console.log`。
- **预制体**：`assets/prefabs/Player.prefab` 是绑定 `PlayerView` 的玩家节点；`GameManager.spawnPlayer` 用 `instantiate(this.playerPrefab)` 生成并挂到 `Dungeon` 子节点下。
- **Tilemap 数据**：附了一份 `assets/resources/map/grass.tmx`（Tiled 导出），目前代码用的是程序生成，没消费 tmx。

## 已完成 / 进行中

- ✅ 五层目录 + `EventManager` 事件总线
- ✅ `DungeonGenerator` 跑通 80×50 + 15 房间
- ✅ `GameManager` 串起：场景加载 → 生成地牢 → spawn 玩家 → 相机跟随
- ✅ `Player.prefab` 已就绪
- ✅ `INPUT_MOVE_INTENT` 接通，玩家能走格子
- ⏳ 怪物 / 战斗 / 回合制
- ⏳ 真正的 Tilemap 渲染（用 `DungeonView.initialize` 把 Tile 画到 `cc.Tilemap`，而非只是 console 打印）
- ⏳ FOV / 迷雾 / 持久化
- ❌ 单元测试

## 本地开发

```bash
# 用 Cocos Creator 3.8.7 打开本目录即可
# 编辑器会识别 package.json 里的 creator.version 字段
# 打开后场景：assets/scenes/test.scene
# 直接点编辑器上的"运行"或构建到目标平台
```

## 状态

v0.x（prefab + 地图渲染系统已添加），**能跑出可探索的房间地图，玩家能走格子**；怪物 / 战斗 / 回合制都还没接。

## License

未声明 License。
