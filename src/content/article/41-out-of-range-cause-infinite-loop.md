title: 数组越界引起的无限循环
date: 2018.12.01
---

有下面这样一段 C 语言代码

```c
int main(int argc, char* argv[]){
    int i = 0;
    int arr[3] = {0};
    for(; i<=3; i++){
        arr[i] = 0;
        printf("hello world\n");
    }
    return 0;
}
```

因为数组越界，所以会导致一直打印 `hello world`。我们可以在终端实际运行一下。

```
$ gcc -fno-stack-protector main.c -o main
$ ./main
hello world
hello world
hello world
hello world
...
```

因为现代编译器都有溢出保护机制，所以需要加上 `-fno-stack-protector`。这里是因为 `arr[3]` 越界了，而且刚好指向变量 `i`。我们可以把各个变量的内存地址打印出来，验证一下，修改上面的代码。

```c
int main(int argc, char* argv[]){
    int i = 0;
    int arr[3] = {0};
    printf("i: %u\n",&i);
    for(; i<=2; i++){
        printf("arr[%d]: %u\n", i, &arr[i]);
        arr[i] = 0;
    }
    return 0;
}
```

重新编译一下。

```
$ gcc -fno-stack-protector main.c -o main
$ ./main
i: 3846382636
arr[0]: 3846382624
arr[1]: 3846382628
arr[2]: 3846382632
```

可以看到 `arr[2]` 的地址加上 4 就是 `i` 的地址，所以 `arr[3]` 实际指向的就是 `i`。到这里为止，一开始那段无限循环的原因也算找到了。

当然我们还可以多尝试几种情况，比如更换下数组和变量 `i` 的声明顺序。

```c
int arr[3] = {0};
int i = 0;
```

然后再次打印内存地址。

```
i: 3824608288
arr[0]: 3824608292
arr[1]: 3824608296
arr[2]: 3824608300
```

可以看到即使数组越界，也不会造成无限循环。除了声明顺序外，因为 64 位操作系统会进行 8 字节对齐，所以我们给数组增加多一个元素，让其长度为 4。

```c
int i = 0;
int arr[4] = {0};
```

再看下内存地址。

```
i: 3987985452
arr[0]: 3987985424
arr[1]: 3987985428
arr[2]: 3987985432
arr[3]: 3987985436
```

可以看到变量 i 的地址不会紧跟着数组，所以同样不会无限循环。

（完）
