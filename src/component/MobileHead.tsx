import * as React from "react";
import styled from "styled-components";
import { MenuProps } from "./PCHead";

const Container = styled.div`
    position: relative;
    @media screen and (min-width: 770px) {
        display: none;
    }
`;

const BrandMobile = styled.div`
    text-align: center;
    background-color: #464d5c;
    color: #fff;
    padding: 40px 10px;
    font-size: 40px;
`;

const Tag = styled.span`
    color: #bee178;
`;

const NavBar = styled.button`
    position: absolute;
    right: 0px;
    padding: 19px 19px;
    top: 0px;
    border-radius: 50%;
    background-color: transparent;
    border-color: transparent;
    transition: 0.5s background-color;
`;

const NavIcon = styled.span`
    height: 2px;
    width: 18px;
    margin-bottom: 3px;
    display: block;
    background-color: #bee178;
`;

const NavMenu = styled.ul`
    position: absolute;
    right: 20px;
    top: 42px;
    width: 150px;
    height: 125px;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.117647) 0 1px 6px,
        rgba(0, 0, 0, 0.239216) 0 1px 4px;
    transition: 0.2s;
    overflow: hidden;
    padding: 10px 0;

    & > li {
        list-style: none;

        & > a {
            text-decoration: none;
            color: #777;
            display: block;
            padding: 10px 20px;
        }
    }
`;

export default class MobileHead extends React.PureComponent<
    MenuProps,
    { showMenu: boolean }
> {
    constructor(props) {
        super(props);

        this.state = {
            showMenu: false
        };

        this.toggleMenu = this.toggleMenu.bind(this);
    }

    toggleMenu() {
        this.setState({
            showMenu: !this.state.showMenu
        });
    }

    render() {
        const { showMenu } = this.state;

        return (
            <Container>
                <BrandMobile>
                    <Tag>{"<Leodots />"}</Tag>
                </BrandMobile>

                <NavBar onClick={this.toggleMenu}>
                    <NavIcon />
                    <NavIcon />
                    <NavIcon />
                </NavBar>

                <NavMenu style={showMenu ? null : { width: 0, height: 0 }}>
                    <li>
                        <a href="/">首页</a>
                    </li>
                    <li>
                        <a href="/archive.html">归档</a>
                    </li>
                    <li>
                        <a href="/about.html">关于</a>
                    </li>
                </NavMenu>
            </Container>
        );
    }
}
