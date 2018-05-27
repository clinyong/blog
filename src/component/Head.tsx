import * as React from "react";
import PCHead, { Menu } from "./PCHead";
import MobileHead from "./MobileHead";

const menuList: Menu[] = [
    {
        title: "首页",
        link: "/"
    },
    {
        title: "归档",
        link: "/archive.html"
    },
    {
        title: "关于",
        link: "/about.html"
    }
];

export default class Head extends React.PureComponent<{}, {}> {
    render() {
        return (
            <div>
                <PCHead list={menuList} />
                <MobileHead list={menuList} />
            </div>
        );
    }
}
