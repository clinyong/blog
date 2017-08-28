title: 避免在 react render 中使用箭头函数和 bind
date: 2017.08.28
---

在平时写 react 组件的时候，我们会习惯于像下面这样去绑定事件

```jsx
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [
                { id: 1, name: 'Cory' }, 
                { id: 2, name: 'Meg' }, 
                { id: 3, name: 'Bob' }
            ]
        };
    }

    deleteUser = id => {
        this.setState(prevState => {
            return { 
                users: prevState.users.filter( user => user.id !== id)
            }
        })
    }

    render() {
        return (
            <div>
                <h1>Users</h1>
                <ul>
                    { 
                        this.state.users.map(user => {
                            return (
                                <li>
                                    <input 
                                        type="button" 
                                        value="Delete" 
                                        onClick={() => this.deleteUser(user.id)} 
                                    />
                                    {user.name}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        );
    }
}
```

这里的 `onDeleteClick` 绑定了一个箭头函数，每次 `render` 的时候，这个函数都会重新创建。假如这个 `users` 是个很长的列表，有 1 万多项，每次 `render` 的时候，这个函数就要被创建 1 万多次。如果这里传递的是一个组件

```jsx
<User
    name={user.name}
    id={user.id}
    onClick={() => this.deleteUser(user.id)}
/>
```

由于传进去的 `onDeleteClick` 每次 `render` 都变化，所以组件 `User` 即使在相同的 `id` 和 `name` 的情况下，每次也都会发生改变。当然用 `bind` 去绑定也存在上面说的这些问题。

```jsx
<li>
    <input 
        type="button" 
        value="Delete" 
        onClick={this.deleteUser.bind(this, user.id)} 
    />
    {user.name}
</li>
```

那要怎么解决呢？下面这两篇文章提到了两种比较巧妙的解决办法

- [React Pattern: Extract Child Components to Avoid Binding](https://medium.freecodecamp.org/react-pattern-extract-child-components-to-avoid-binding-e3ad8310725e)
- [Another way to avoid binding in render](https://medium.com/@mgnrsb/another-way-to-avoid-binding-in-render-in-simple-cases-like-this-where-all-you-need-is-to-remember-68af83da0258)

第一种方法，抽象成一个子组件，在子组件里面去传参数

```jsx
class User extends React.Component {
    onDeleteClick = () => {
        this.props.onDelete(this.props.id); // 在这里传入 id
    };

    render() {
        return (
            <li>
                <input 
                type="button" 
                value="Delete" 
                onClick={this.onDeleteClick} 
                />
                {this.props.name}
            </li>
        );
    }
}

class App extends React.Component {
    // ...

    render() {
        return (
            <div>
                <h1>Users</h1>
                <ul>
                    { 
                        this.state.users.map(user => {
                            return (
                                <User
                                    id={user.id}
                                    name={user.name}
                                    onDelete={this.deleteUser}
                                />
                            )
                        })
                    }
                </ul>
            </div>            
        );
    }
}
```

第二种方法，把参数加到 html 元素的属性上面

```jsx
class App extends React.Component {
    // ...

    deleteUser = e => {   
        const id = e.target.value
        this.setState(prevState => {      
            return { 
                users: prevState.users.filter( user => user.id !== id)
            }    
        })  
    } 

    render() {
        return (
            <div>
                <h1>Users</h1>
                <ul>
                    { 
                        this.state.users.map(user => {
                            return (
                                <li>
                                    <input 
                                        type="button" 
                                        value={user.id}
                                        onClick={this.deleteUser} 
                                    />
                                    {user.name}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>            
        );
    }
}
```

如果你有用 eslint，也可以启用一条规则来检测，[No .bind() or Arrow Functions in JSX Props](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)。

### 参考

- [Why Arrow Functions and bind in React’s Render are Problematic](https://medium.freecodecamp.org/why-arrow-functions-and-bind-in-reacts-render-are-problematic-f1c08b060e36)
