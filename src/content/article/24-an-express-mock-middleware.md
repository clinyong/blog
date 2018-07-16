title: 一个 express mock 的中间件
date: 2018.07.16
---

公司的前后端都是通过同一份接口定义文件去生成接口代码，前期用的是 [thrift](https://thrift.apache.org/)，后面转成 [protobuf](https://developers.google.com/protocol-buffers/)。基本的流程像下面这样

```text
thrift/protobuf => Go/TypeScript/Java/Swift
```

当接口需要修改的时候，实际是去修改定义好的这份文档，然后各端再重新生成一下代码。整个流程，用过的人都觉得爽。

在开发的时候，前端经常会遇到另外一个问题，需要等后端把接口写完才开始写页面，不然的话就只能先自己在页面手动写一些假数据。因为我们是用 TypeScript，所以实际已经是知道接口返回哪些字段，并且字段是什么类型。所以，是不是可以根据这些信息自动去生成假数据呢？

根据这样的思路，便写了一个 express 中间件，ezmok。对于为什么不是叫 ezmock 呢，因为这个名字在 npm 上面已经被注册了。:(

先说下最重要的数据生成部分。一开始打算用 TS 的 api 去分析生成的代码，因为之前逛[知乎](https://www.zhihu.com/question/66797506/answer/247477263)的时候，知道有个叫 json schema 的东西。查了一下，感觉像是发现了新大陆。社区已经有很多现成的库来满足我所有的需求。

- TypeScript 转 JSON Schema，可以用 `typescript-json-schema`
- 生成数据可以用 `json-schema-faker`
- `react-jsonschema-form` 可以根据 JSON Schema 自动生成表单，支持填充进数据，这样就可以很方便地编辑事先生成好的假数据

具体的代码，服务器端获取 schema 部分

```ts
import * as TJS from "typescript-json-schema";

export async function getAPISchema(apiPath: string): Promise<TJS.Definition | null> {
    // 获取具体的定义文件路径
    const fileInfo = await getAPIFileInfo(apiPath);
    // 获取接口返回参数信息
    const typeName = await getTypeName(fileInfo);

    // 分析整个文件
    const program = TJS.getProgramFromFiles([fileInfo.path]);
    // 找到接口返回信息对应的 schema
    const schema = TJS.generateSchema(program, typeName.name, {
        ignoreErrors: true,
        required: true
    });

    return schema;
}
```

客户端根据 schema 生成数据

```ts
import * as jsf from "json-schema-faker";

function genFakeData(schema) {
    return jsf.resolve(schema);
}
```

根据 schema 和数据生成表单

```tsx
import Form from "react-jsonschema-form";

class SchemaForm extends React.PureComponent<SchemaFormProps, {}> {
    onSubmit = e => {
        this.props.onSubmit(e.formData);
    };

    render() {
        const { schema, formData, generateData } = this.props;
        const widgets = {
            BaseInput: BaseInputWidget,
            SelectWidget,
            CheckboxWidget
        };

        // simply update to draft-6....
        const schemaV6 = Object.assign({}, schema, {
            $schema: "http://json-schema.org/draft-06/schema#"
        });

        return (
            <Form
                schema={schemaV6}
                widgets={widgets}
                FieldTemplate={SchemaTemplate}
                ArrayFieldTemplate={ArrayFieldTemplate}
                onSubmit={this.onSubmit}
                formData={formData}
            >
                <div style={{ textAlign: "center" }}>
                    <Button style={{ marginRight: 20 }} onClick={generateData}>
                        重新生成数据
                    </Button>
                    <Button type="primary" htmlType="submit">
                        提交
                    </Button>
                </div>
            </Form>
        );
    }
}
```

`react-jsonschema-form` 最简单的用法就是把 schema 和数据传过去就行。从上面的代码也可以看到，这个库还是非常灵活，支持自定义各种 widget 和 template。

上面就是数据的生成和管理部分。除此之外，还需要判断哪些路径是需要 mock 的，所以大致的中间件就像下面这样

```ts
const EZMOK_PREFIX = "/ezmok";

function ezmokMiddleware() {
    const jsonParser = bodyParser.json();
    jsonParser(req, res, afterParseJSON);

    function afterParseJSON() {
        const apiPath = req.path;
        if (apiPath.startsWith(EZMOK_PREFIX)) {
            // ezmok 相关的功能
            if (req.method === "GET") {
                // 如果是 Get 请求，则返回 ezmok 的后台界面
            } else {
                // 相关的接口调用，比如生成 schema 之类的
            }
        } else {
            // 实际的业务接口调用
            const mockData = globalSetting.getMockData();
            if (mockData.path.includes(apiPath)) {
                // 知道这个接口要 mock，返回对应的数据
            } else {
                // 这部分的接口不用 mock，重定向到真正的接口地址
                res.redirect(
                    307,
                    realAPIHost
                );
            }
        }
    }
}
```

因为这个中间件的代码很多是和公司内部的技术栈耦合，所以源码就没有放到 github 上面，有兴趣的可以直接到 [npm](https://www.npmjs.com/package/ezmok) 看看。

（完）
