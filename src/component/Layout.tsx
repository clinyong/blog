import * as React from "react";
import styled, { injectGlobal } from "styled-components";

injectGlobal`
html {
    position: relative;
    background-color: #464d5c;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', 'WenQuanYi Micro Hei',sans-serif;
    @media screen and (min-width: 770px) {
        background-color: #ECF0F1;
    }
}

html, body {
    min-height: 100%;
    margin: 0;
    padding: 0;
}

#app {
    min-height: 100%;
}
`;

const Container = styled.div`
    position: relative;
    min-height: 100%;
`;
const Content = styled.div`
    padding-bottom: 60px;
    @media screen and (min-width: 770px) {
        padding: 0px 0 100px;
    }
`;

const Header = styled.ul`
    display: none;
    @media screen and (min-width: 770px) {
        display: block;
        text-align: center;
        margin-right: 50px;
        margin-bottom: 30px;
        margin-top: 0px;
        padding-top: 30px;

        & > a {
            color: #222;
            text-align: center;
            text-decoration: none;
            font-size: 18px;

            &:hover {
                border-bottom: 2px solid #222;
            }
        }
    }
`;

const Footer = styled.div`
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
`;

const Coding = styled.span`
    color: #999;

    & > a {
        color: #bee178 !important;
        text-decoration: none;

        @media screen and (min-width: 770px) {
            color: #108ee9 !important;
            text-decoration: underline;
        }
    }
`;

export default class Layout extends React.PureComponent<{}, {}> {
    componentDidMount() {
        function injectGA() {
            (function(i, s, o, g, r, a, m) {
                i["GoogleAnalyticsObject"] = r;
                (i[r] =
                    i[r] ||
                    function() {
                        (i[r].q = i[r].q || []).push(arguments);
                    }),
                    (i[r].l = 1 * new Date());
                (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m);
            })(
                window,
                document,
                "script",
                "https://www.google-analytics.com/analytics.js",
                "ga"
            );

            ga("create", "UA-91794310-1", "auto");
            ga("send", "pageview");
        }
        if (process.env.NODE_ENV === "production") {
            injectGA();
        }
    }

    render() {
        return (
            <Container>
                <Header>
                    <a href="/">首页</a>
                    <a href="/archive.html" style={{ margin: "0 50px" }}>
                        归档
                    </a>
                    <a href="/about.html">关于</a>
                </Header>
                <Content>{this.props.children}</Content>
                <Footer>
                    <Coding>
                        Power by&nbsp;
                        <a href="https://github.com/clinyong/cubi">Cubi</a>,
                        &nbsp;
                    </Coding>
                    <Coding>
                        Hosted by&nbsp;
                        <a href="https://pages.coding.me">Coding Pages</a>
                    </Coding>
                </Footer>
            </Container>
        );
    }
}
