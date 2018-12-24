<template>
  <div id="app" class="map">
    <div class="snake-map">
      <ul
        class="snake-item-list"
        v-for="(row ,index) in canvas"
        :key="row[0].id"
        :id="row[0].id"
      >
        <li
          v-for="item in row"
          :key="item.id"
          :id="item.id"
          class="snake-item"
          :class="renderSnakeItem(item, index)"
          :style="computedItemStyle(item, index)"
        >
        </li>
      </ul>
    </div>
    <div class="system-option">
      <div class="btn-warp">
        <div class="btn" @click="initSnake">{{ started ? '重新开始' : '开始游戏' }}</div>
        <div class="btn" @click="speedUp">加速</div>
      </div>
      <div class="option-warp" v-show="started">
        <div class="option-item up" @click="move('up')">上</div>
        <div class="option-item-inner">
          <div class="option-item left" @click="move('left')">左</div>
          <div class="option-item right" @click="move('right')">右</div></div>
        <div class="option-item down" @click="move('down')">下</div>
      </div>
    </div>
  </div>
</template>

<script>
/*
*
* */
let timer = null;
export default {
  name: 'App',
  data () {
    return {
      len: 40, // 画布宽高格子数量
      size: 20, // 格子的宽高（px）
      canvas: [], // 画布
      snake: [], // 蛇
      food: {}, // 食物
      dir: '', // 方向
      snakeHead: {}, // 头
      snakeBody: [], // 身子
      speed: 500, // 单位ms
      started: false,
    };
  },
  mounted () {
    const { len } = this;
    const canvas = [];
    for (let i = 0; i < len; i++) {
      const row = [];
      for (let j = 0; j < len; j++) {
        row.push({
          id: Math.random().toString(32).substr(2),
          x: i,
          y: j,
          rowIndex: i,
          colIndex: j,
          snake: false,
          obstacle: j === 0 || j === (this.len - 1) // 第一个和最后一个是障碍物
        });
      }
      canvas.push(row);
    }
    this.$set(this, 'canvas', canvas);
  },
  methods: {
    computedWrapStyle () {
      return {
        width: `${this.len * this.size}px`,
        height: `${this.len * this.size}px`
      };
    },
    // 计算每个格子的样式
    computedItemStyle (item) {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      };
    },
    // 创建食物
    createFood () {
      const food = Object.assign(this.getRandomItem(true), { food: true }); // 随机获取一次
      this.$set(this, 'food', food);
    },
    // 随机获取地图中的一项，如果生成的食物与蛇重合，重新生成（最简单的实现方案就是重新生成，不过如果生成的随机总是在蛇身上，会比较浪费资源，后续可以找排除算法来解决这个问题）
    getRandomItem (noRepeat) {
      const rowRandom = Math.round((Math.random() * (this.len - 1)));
      const row = this.canvas[rowRandom];
      const itemRandom = Math.round((Math.random() * (this.len - 1)));
      const item = row[itemRandom];
      if (noRepeat && item.snake) { // 如果要求不重复，生成的是蛇，就重新生成
        console.log('重复了，重新生成');
        return this.getRandomItem();
      }
      return item;
    },
    // 初始化蛇
    initSnake () {
      const item = this.getRandomItem();
      this.snakeHead = Object.assign(item, {});
      this.canvas.forEach(child => {
        child.map(snake => {
          if (item.id === snake.id) {
            snake.head = true;
            snake.snake = true;
          } else {
            snake.snake = false;
            snake.head = false;
          }
          return snake;
        });
      });
      console.log(JSON.parse(JSON.stringify(this.canvas)));
      this.$set(this, 'canvas', this.canvas);
      this.createFood();
      this.started = true;
      document.body.addEventListener('keydown', this.autoMove, false);
    },
    // 加速
    speedUp () {

    },
    // 自动
    autoMove (e) {
      let dir;
      switch (e.keyCode) {
        case 37: {
          dir = 'left';
          break;
        }
        case 38: {
          dir = 'up';
          break;
        }
        case 39: {
          dir = 'right';
          break;
        }
        case 40: {
          dir = 'down';
          break;
        }
        default:
      }
      if (timer) {
        clearInterval(timer);
      }
      this.move(dir); // 立即移动一次，然后开启定时器
      timer = setInterval(() => {
        console.log('我运行了啊');
        this.move(dir);
      }, 500);
    },
    // 停止游戏
    stopGame () {
      document.body.removeEventListener('keydown', this.autoMove, false);
      clearInterval(timer);
      this.started = false;
    },
    // 检查是否目标在蛇身上
    checkInSnake (target) {
      const head = this.snakeHead;
      const body = this.snakeBody;
      if (head.id === target.id) {
        return true;
      }
      if (body.filter(item => item.id === target.id).length) {
        return true;
      };
      return false;
    },
    // 更新蛇的形状
    updateSnake () {
      const { snakeHead, snakeBody } = this;
      // 往左：x不变，y-1
      const rowIndex = snakeHead.rowIndex;
      const colIndex = snakeHead.colIndex;
      const cacheSnakeHead = { ...snakeHead }; // 缓存头
      const source = this.canvas[rowIndex][colIndex]; // 源
      let target, error;
      switch (this.dir) {
        case 'left': {
          if (colIndex === 0) {
            console.log('撞墙了，游戏结束');
            error = true;
            return;
          }
          target = this.canvas[rowIndex][colIndex - 1]; // 取目标
          break;
        }
        case 'up': {
          if (rowIndex === 0) {
            console.log('撞墙了，游戏结束');
            error = true;
            return;
          }
          target = this.canvas[rowIndex - 1][colIndex]; // 取目标
          break;
        }
        case 'right': {
          if (colIndex === this.len - 1) {
            console.log('撞墙了，游戏结束');
            error = true;
            return;
          }
          target = this.canvas[rowIndex][colIndex + 1]; // 取目标
          break;
        }
        case 'down': {
          if (rowIndex === this.len - 1) {
            console.log('撞墙了，游戏结束');
            error = true;
            return;
          }
          target = this.canvas[rowIndex + 1][colIndex]; // 取目标
          break;
        }
        default:
      }
      if (error) { // 如果游戏结束了
        this.stopGame();
        return;
      }
      if (this.checkInSnake(target)) {
        this.stopGame();
        console.log('吃到自己了，游戏结束');
        return;
      }
      target.snake = true;
      target.head = true;
      source.snake = false;
      source.head = false;
      this.snakeHead = {
        ...target,
        snake: true,
        head: true
      };
      if (target.food) { // 如果目标是食物，身体会增长（其实就是身子不动，前面多加了一个）
        console.log('吃到东西了');
        snakeBody.unshift({
          ...cacheSnakeHead,
          snake: true,
          head: false
        });
        snakeBody.map((c, i) => {
          c.food = false;
          i && (c.head = false);
          this.canvas[c.rowIndex][c.colIndex].snake = true;
          return c;
        });
        source.snake = true; // 重写一次头部
        source.head = false;
        target.food = false;
        this.$nextTick(() => {
          this.createFood();
        });
      } else if (snakeBody.length) { // 将所有的格子往前（头的方向）挪动一格
        source.head = false;
        snakeBody.unshift({ // 往身子添加原始头
          ...cacheSnakeHead,
          snake: true,
          head: false
        });
        snakeBody.map((c, i) => {
          i && (c.head = false); // 设置身子所有的都为snake
          this.canvas[c.rowIndex][c.colIndex].snake = true; // 刷新对应的数据
          if (i === snakeBody.length - 1) {
            c.snake = false; // 将最后一个取消蛇的标记
            this.canvas[c.rowIndex][c.colIndex].snake = false; // 刷新对应的数据
          }
          return c;
        });
        snakeBody.pop(); // 删除最后一个
      }
      this.$set(this, 'snakeHead', this.snakeHead); // 更新head
      this.$set(this, 'snakeBody', snakeBody); // 更新body
      this.$set(this, 'canvas', this.canvas); // 更新canvas
    },
    // 渲染每个格子
    renderSnakeItem (item) {
      const classNames = [];
      if (item.snake) { //  如果是蛇，添加蛇的样式
        classNames.push('snake');
      }
      if (item.id === this.food.id) { // 食物
        classNames.push('food'); // 添加食物的样式
      }
      return classNames;
    },
    eat () {

    },
    move (dir) {
      /*
      * 往左：x不变，y-1
      * 往右：x不变，y+1
      * 网上：x-1, y不变
      * 往下：x+1, y不变
      * */
      switch (dir) {
        case 'left': {
          if (this.dir === 'right') {
            console.log('头在右边，不能往左');
            break;
          }
          this.dir = dir;
          this.updateSnake();
          break;
        }
        case 'up': {
          if (this.dir === 'down') {
            const head = this.snakeHead;
            console.log(head);
            break;
          }
          this.dir = dir;
          this.updateSnake();
          break;
        }
        case 'right': {
          if (this.dir === 'left') {
            console.log('头在左边，不能往右');
            break;
          }
          this.dir = dir;
          this.updateSnake();
          break;
        }
        case 'down': {
          if (this.dir === 'up') {
            console.log('头在上边，不能往下');
            break;
          }
          this.dir = dir;
          this.updateSnake();
          break;
        }
        default:
      }
    }
  }
};
</script>

<style lang="less">
div, p, ul, li {
  margin: 0;
  padding: 0;
}
ul, li {
  list-style: none;
}
.map {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.snake-map {
  border: 1px solid #e0e0e0;
  .snake-item-list {
    width: 100%;
    margin: 0;
    padding: 0;
    clear: both;
    overflow: hidden;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    &:last-child {
      border: none;
    }
  }
  .snake-item {
    border-right: 1px solid #e0e0e0;
    color: #999;
    font-size: 12px;
    &:last-child {
      border-right: none;
    }
  }
}
.snake-item.food {
  background: #444;
}
.snake-item.snake {
  background: #2bdab3;
}
.system-option {
  flex: 1;
  margin: 20px;
  width: 300px;
  .btn-warp {
    flex: 1;
    clear: both;
    width: 100%;
    display: flex;
    justify-content: center;
    .btn {
      width: 80px;
      margin-right: 10px;
      text-align: center;
      color: dodgerblue;
      cursor: pointer;
      padding: 5px 15px;
      border: 1px solid dodgerblue;
      margin-bottom: 10px;

      &:active {
        background: #e0e0e0;
      }
    }
  }
  .option-warp {
    flex: 1;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .option-item {
      width: 50px;
      height: 30px;
      line-height: 30px;
      padding: 0 15px;
      border: 1px solid dodgerblue;
      text-align: center;
      cursor: pointer;
      margin: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      &.up {
      }
      &.left {
      }
      &.right {
      }
      &.down {
      }
    }
    .option-item-inner {
      display: flex;
      justify-content: space-between;
      clear: both;
    }
  }
}
</style>
