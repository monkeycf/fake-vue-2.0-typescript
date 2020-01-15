import FakeVue from "./FakeVue";
import {Dep} from "./Dep";

/**
 * 依赖，根据调用创造
 */
export class Watcher {
  constructor(private vm: FakeVue, private key: string, private cb: (value: JSONValue) => void) {
    Dep.target = this;
  }

  /**
   * 更新相关内容
   */
  public update(): void {
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
