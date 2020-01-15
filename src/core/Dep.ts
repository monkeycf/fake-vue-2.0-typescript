import {Watcher} from './Watcher';

/**
 * 依赖存储
 */
export class Dep {
  private watchers: Array<Watcher>;
  static target: Watcher = null; // 暂时存储Watcher，在get时添加到dep

  constructor() {
    this.watchers = [];
  }

  /**
   * 添加依赖
   * @param watcher
   */
  public add(watcher: Watcher): void {
    this.watchers.push(watcher);
    Dep.target = null;
  }

  /**
   * 更新存储的相关依赖
   */
  public update(): void {
    this.watchers.forEach((w): void => w.update());
  }
}
