import FakeVue from "./FakeVue";
import {Watcher} from "./Watcher";

interface ITypeUpdater {
  (node: Node, value: string): void;
}

/**
 * 编译
 */
export class Compile {
  private readonly fragment: DocumentFragment;

  constructor(private vm: FakeVue) {
    let node: Node = document.querySelector(vm.$options.el);
    this.fragment = Compile.nodeToFragment(node);
    this.compileFragment(this.fragment);
    node.appendChild(this.fragment);
  }

  /**
   * 转换内部内容为片段Fragment
   * @param node
   */
  private static nodeToFragment(node: Node): DocumentFragment {
    let fragment: DocumentFragment = document.createDocumentFragment();

    // 将el中所有子元素搬家至fragment中
    let child: Node;
    while ((child = node.firstChild)) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  /**
   * 编译fragment片段
   * @param fragment
   */
  private compileFragment(fragment: DocumentFragment | Node): void {
    let nodes: NodeListOf<ChildNode> = fragment.childNodes;

    Array.from(nodes).forEach((node: Node): void => {
      if (Compile.isElement(node)) {
        // 对属性遍历
        Array.from((node as Element).attributes).forEach((attr: Attr): void => {
          // 对 k- 开头的属性处理
          if (/^k-(.*)$/.test(attr.name)) {
            this.updater(node, attr.value, RegExp.$1);

            // 对 k-model实现数据的双向绑定
            if (RegExp.$1 === 'model') {
              node.addEventListener('keyup', (): void => {
                this.vm[attr.value] = (node as HTMLInputElement).value;
              })
            }
          } else if (/^@(.*)$/.test(attr.name)) {
            // 对 @ 开头的事件处理
            node.addEventListener(RegExp.$1, () => this.vm.$options.methods[attr.value].call(this.vm));
          }
        })
      } else if (Compile.isInterpolation(node)) {
        // {{ }}
        this.updater(node, RegExp.$1.trim(), 'interpolation');
      }

      // 递归子节点
      if (node.hasChildNodes()) {
        this.compileFragment(node);
      }
    })
  }

  /**
   * 判断节点是否为文本类型且{{ }}
   * @param node
   * @return boolean
   */
  private static isInterpolation(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE && /{{(.*)}}/.test(node.textContent);
  }

  /**
   * 判断节点类型是否为ELEMENT
   * @param node
   * @return boolean
   */
  private static isElement(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE
  }

  /**
   * 更新助手
   * 根据type调用不用的更新函数
   * @param node
   * @param key
   * @param type
   */
  private updater(node: Node, key: string, type: string): void {
    const fuc = Compile[`${type}Updater`];

    /**
     * 先进行依赖收集，再初始化
     * 否则需要在依赖收集中，主动触发get
     */
    // 依赖收集
    new Watcher(this.vm, key, ((value) => {
      fuc && fuc(node, value);
    }));

    // 初始化
    fuc && fuc(node, this.vm[key]);
  }

  /**
   * interpolation，{{ }}类型的更新
   * @param node
   * @param value
   */
  private static interpolationUpdater: ITypeUpdater = (node: Node, value: string) => {
    node.textContent = value;
  };

  /**
   * k-text类型更新
   * @param node
   * @param value
   */
  private static textUpdater: ITypeUpdater = (node: Node, value: string) => {
    node.textContent = value;
  };

  /**
   * k-model类型更新
   * @param node
   * @param value
   */
  private static modelUpdater: ITypeUpdater = (node: Node, value: string) => {
    (node as HTMLInputElement).value = value;
  };

  /**
   * k-html类型更新
   * @param node
   * @param value
   */
  private static htmlUpdater: ITypeUpdater = (node: Node, value: string) => {
    (node as Element).innerHTML = value;
  };
}
