import { _decorator } from "cc";

type Callback = (...args: any[]) => void;
interface IEventData {
  callback: Callback;
  target: any;
}

export class EventManager {
  private static _instance: EventManager | null = null;
  private eventMap: Map<string, IEventData[]> = new Map();

  public static get instance(): EventManager {
    if (!this._instance) {
      this._instance = new EventManager();
    }
    return this._instance;
  }

  public on(eventName: string, callback: Callback, target: any): void {
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, []);
    }
    const events = this.eventMap.get(eventName);
    if (events.some((e) => e.target === target && e.callback === callback)) {
      return;
    }
    events.push({ callback, target });
  }

  public off(eventName: string, callback: Callback, target: any): void {
    if (!this.eventMap.has(eventName)) {
      return;
    }
    const events = this.eventMap.get(eventName);
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (event.target === target && event.callback === callback) {
        events.splice(i, 1);
        break;
      }
    }
    if (events.length === 0) {
      this.eventMap.delete(eventName);
    }
  }

  public emit(eventName: string, ...args: any[]): void {
    if (!this.eventMap.has(eventName)) {
      return;
    }
    const events = [...this.eventMap.get(eventName)];
    for (const event of events) {
      event.callback.apply(event.target, args);
    }
  }
}
