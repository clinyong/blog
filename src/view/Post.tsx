import * as React from "react";
import styled from "styled-components";
import showdown from "showdown";
import Layout from "../component/Layout";
import * as hljs from "highlight.js/lib/highlight";

import "highlight.js/styles/github.css";

hljs.registerLanguage(
    "javascript",
    require("highlight.js/lib/languages/javascript")
);
hljs.registerLanguage(
    "typescript",
    require("highlight.js/lib/languages/typescript")
);
hljs.registerLanguage("css", require("highlight.js/lib/languages/css"));
hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"));

const converter = new showdown.Converter();

function lazyLoadDisqus() {
    function debounce(func, wait) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, wait);
        };
    }
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const html = document.documentElement;

        return rect.top < (window.innerHeight || html.clientHeight);
    }
    function injectDisqus() {
        const d = document,
            s = d.createElement("script");
        s.src = "https://leodots.disqus.com/embed.js";
        s.setAttribute("data-timestamp", +new Date());
        (d.head || d.body).appendChild(s);
    }

    const disqusContainer = document.getElementById("disqus_thread");
    let disqusLoaded = false;
    const loadDisqus = debounce(function() {
        if (isInViewport(disqusContainer) && !disqusLoaded) {
            injectDisqus();
            disqusLoaded = true;
            document.removeEventListener("scroll", loadDisqus);
        }
    }, 100);
    document.addEventListener("scroll", loadDisqus);
}

const Container = styled.div`
    padding: 20px 15px 25px;
    background-color: #fff;
    @media screen and (min-width: 770px) {
        box-sizing: border-box;
        width: 768px;
        margin: 0 auto;
        padding-left: 40px;
        padding-right: 40px;
        box-shadow: 0px 30px 60px 0px #d3dde2;
    }
`;

const Title = styled.div`
    margin-top: 0;
    margin-bottom: 30px;
    text-align: center;
    font-size: 24px;
    @media screen and (min-width: 770px) {
        font-size: 30px;
    }
`;

const DateDisplay = styled.div`
    text-align: center;
    color: #999;
    margin-top: 50px;
    font-size: 12px;
    text-decoration: underline;
`;

const Disqus = styled.div`
    background-color: #fff;
    padding-top: 60px;
`;

const Content = styled.div`
    background-color: #fff;
    font-size: 15px;
    color: #333;

    @media screen and (min-width: 770px) {
        min-height: 500px;
        & a:hover {
            text-decoration: underline;
            cursor: pointer;
        }
    }

    & a {
        color: #3194d0;
    }
    & p,
    & li {
        line-height: 1.8;
    }
    & img {
        display: block;
        max-width: 100%;
        margin: 0 auto 30px;
        @media screen and (min-width: 770px) {
            max-width: 500px;
        }
    }

    & code {
        background: #f2f2f2;
        padding: 2px 5px;
    }

    & pre {
        background: #f2f2f2;
        padding: 20px;
        overflow-x: auto;
        line-height: 1.8;

        & > code {
            padding: 0;
        }
    }

    & blockquote {
        margin-left: 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
    }
`;

interface Content {
    meta: {
        title: string;
        date: string;
    };
    content: string;
}

interface PostProps {
    content: Content;
}

export default class Post extends React.PureComponent<PostProps, any> {
    componentDidMount() {
        if (process.env.NODE_ENV === "production") {
            lazyLoadDisqus();
        }

        hljs.initHighlightingOnLoad();
    }

    render() {
        const { title, date } = this.props.content.meta;
        let content = converter.makeHtml(
            this.props.content.content
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
        );

        return (
            <Layout>
                <Container>
                    <Content>
                        <Title>{title}</Title>

                        <Content
                            dangerouslySetInnerHTML={{ __html: content }}
                        />

                        <DateDisplay>{date}</DateDisplay>
                    </Content>
                    <Disqus id="disqus_thread" />
                </Container>
            </Layout>
        );
    }
}
