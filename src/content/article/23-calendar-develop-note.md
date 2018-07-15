title: 日历组件开发笔记
date: 2018.07.15
---

花了不到一天的时间写了一个日历的[组件](https://github.com/clinyong/react-dates)，写完之后才发现，实现日历的基本功能要比我想象的简单很多。

![](http://ol07x5ssf.bkt.clouddn.com/WechatIMG30374.jpeg)

样式直接用的 antd，这里主要记录下功能实现上面比较麻烦的地方。

闰年和非闰年

```ts
const LEAP_MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const NORMAL_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getMonthDays(year: number, month: number): number {
  if (year % 4 === 0) {
    return LEAP_MONTH_DAYS[month];
  } else {
    return NORMAL_MONTH_DAYS[month];
  }
}
```

通过两个数组，记录每个月的天数，判断一下年份是不是能被 4 整除，获取对应月份的天数。

每个月开始的第一天是星期几

```ts
function getMonthStartDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const paddingLen = getMonthStartDay(year, month);
const displayList: DisplayItem[] = [];
for (let i = 0; i < paddingLen; i++) {
    displayList.push({
    key: "padding" + i,
    value: "",
    type: CellItemType.Padding
    });
}
```

知道是星期几之后，把前面的元素用 `CellItemType.Padding` 类型的空数值填充，起到占位的作用。

上个月和下个月的切换

```ts
nextMonth = () => {
    const { date } = this.state;

    const month = date.getMonth();
    if (month === 11) {
        date.setFullYear(date.getFullYear() + 1, 0);
    } else {
        date.setMonth(month + 1);
    }

    this.setNewDate(date);
};
```

当在切换下个月的时候，如果是最后一个月份，需要把年份 +1。类似的，切换上个月，需要判断是不是第一个月。

（完）
