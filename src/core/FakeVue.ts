import {Observer} from './Observer';
import {Compile} from "./Compile";

interface IOptions {
  readonly el: string;
  data: JSONValue;
  methods: object
}

interface ILifecycleHooksOptions extends IOptions {
  created?: () => void;
}

/**
 * new MVVM()
 */
export default class FakeVue {
  private readonly _$options: ILifecycleHooksOptions;
  private readonly _$data: JSONValue;

  constructor(options: ILifecycleHooksOptions) {
    this._$options = options;
    this._$data = options.data;

    Object.keys(this._$data).forEach(key => {
      // 对$data进行代理
      Object.defineProperty(this, key, {
        get(): any {
          return this.$data[key];
        },
        set(v: any): void {
          this.$data[key] = v;
        }
      })
    });

    new Observer(this);// 遍历元素
    new Compile(this); // 编译，对于html部分的转化

    // 调用生命周期
    options.created && options.created();
  }

  get $data(): JSONValue {
    return this._$data;
  }

  get $options(): ILifecycleHooksOptions {
    return this._$options;
  }
}
