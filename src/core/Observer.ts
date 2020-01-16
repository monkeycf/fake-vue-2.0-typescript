import {Dep} from './Dep';
import FakeVue from "./FakeVue";

/**
 * 遍历属性，添加监听
 */
export class Observer {
  constructor(private vm: FakeVue) {
    this.observerJSON(vm.$data);
  }

  /**
   * 递归遍历json对象
   * @param obj
   */
  private observerJSON(obj: JSONValue): void {
    if (obj == null || typeof obj !== 'object') {
      return;
    }

    Object.keys(obj).forEach((key) => {
      this.defineReactive(obj, key, obj[key]);
    })
  }

  /**
   * 对属性添加监听
   * @param obj
   * @param key
   * @param value
   */
  private defineReactive(obj: JSONValue, key: string, value: JSONValue): void {
    // 对JSON递归
    this.observerJSON(value);

    // 每个属性一个dep用于存储依赖
    let dep: Dep = new Dep();

    Object.defineProperty(obj, key, {
      get(): JSONValue {
        (Dep.target && dep.add(Dep.target));
        return value;
      },
      set(v: JSONValue): void {
        if (value === v) return;
        // 值修改后，对值更新 并更新相关依赖
        value = v;
        dep.update();
      }
    })
  }
}
