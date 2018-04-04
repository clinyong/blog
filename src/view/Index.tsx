import * as React from "react";
import styled from "styled-components";
import Layout from "../component/Layout";

const Container = styled.div`
    width: 100%;
    @media screen and (min-width: 770px) {
        width: 650px;
        margin: 0 auto;
    }
`;

const Head = styled.div`
    position: relative;
    @media screen and (min-width: 770px) {
        display: none;
    }
`;

const BrandMobile = styled.div`
    text-align: center;
    background-color: #464d5c;
    color: #fff;
    padding: 40px 10px 20px;
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

const List = styled.ul`
    padding: 0;
    margin: 0;
    margin-top: 20px;
    font-size: 16px;
    list-style-type: none;
    background-color: #fff;
    @media screen and (min-width: 770px) {
        margin-top: 0;
        box-shadow: 0px 30px 60px 0px #d3dde2;
    }
`;

const Article = styled.li`
    & > a {
        display: block;
        border-bottom: 1px solid #ddd;
        padding: 30px 20px;
        &,
        &:visited,
        &:hover,
        &:active {
            color: #222;
            text-decoration: none;
        }
        @media screen and (min-width: 770px) {
            display: block;
            border-bottom: 1px solid #ddd;
            padding: 20px;
            &:hover {
                cursor: pointer;
                background-color: #eee;
            }
        }
    }
`;

interface IndexProps {
    articles: { link: string; title: string }[];
}

interface IndexState {
    showMenu: boolean;
}

export default class Index extends React.PureComponent<IndexProps, IndexState> {
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
        const { articles } = this.props;
        const { showMenu } = this.state;
        return (
            <Layout>
                <Container>
                    <Head>
                        <BrandMobile>
                            <Tag>{"<Leodots />"}</Tag>
                        </BrandMobile>

                        <NavBar onClick={this.toggleMenu}>
                            <NavIcon />
                            <NavIcon />
                            <NavIcon />
                        </NavBar>

                        <NavMenu
                            style={showMenu ? null : { width: 0, height: 0 }}
                        >
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
                    </Head>

                    <div>
                        <List>
                            {articles.map(item => (
                                <Article key={item.link}>
                                    <a href={item.link}>{item.title}</a>
                                </Article>
                            ))}
                        </List>
                    </div>
                </Container>
            </Layout>
        );
    }
}
