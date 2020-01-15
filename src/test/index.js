import FakeVue from "../core/FakeVue";

const options = {
  el: '#app',
  data: {
    name: 'I am test.',
    age: 12,
    html: '<button @click="changeName">按钮</button>',
  },
  created() {
    setTimeout(() => {
      this.data.name = '我是测试';
    }, 1500);
  },
  methods: {
    changeName() {
      this.name = '调用了函数修改';
    },
  }
};
new FakeVue(options);
