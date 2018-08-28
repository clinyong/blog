import * as React from "react";
import styled, { injectGlobal } from "styled-components";
import Head from "./Head";
import Footer from "./Footer";

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
    min-height: 100vh;
    margin: 0;
    padding: 0;
}

#app {
    min-height: 100vh;
}
`;

const Container = styled.div`
    position: relative;
    min-height: 100vh;
`;
const Content = styled.div`
    padding-bottom: 60px;
    @media screen and (min-width: 770px) {
        padding: 0px 0 100px;
        margin-left: calc(100vw - 100%);
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
                <Head />
                <Content>{this.props.children}</Content>
                <Footer />
            </Container>
        );
    }
}
