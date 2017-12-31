import * as React from "react";
import styled from "../../../cubi/node_modules/styled-components";
import Layout from "../component/Layout";

const Container = styled.div`
    width: 100%;
    @media screen and (min-width: 770px) {
        width: 768px;
        margin: 0 auto;
    }
`;

const Head = styled.div`
    height: 150px;
    line-height: 150px;
    position: relative;
    @media screen and (min-width: 770px) {
        display: none;
    }
`;

const BrandMobile = styled.div`
    text-align: center;
    background-color: #464d5c;
    color: #fff;
    padding: 10px;
    font-size: 40px;
`;

const Tag = styled.span`
    color: #bee178;
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

const BrandPC = styled.li`
    background-color: #464d5c;
    font-size: 24px;
    padding: 15px;
    padding-left: 20px;
    @media screen and (max-width: 770px) {
        display: none;
    }
`;

const Shell = styled.span`
    color: #bee178;
    font-size: 22px;
`;

const Command = styled.span`
    color: #61c4ca;
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

export default class Index extends React.PureComponent<IndexProps, {}> {
    static async getInitialProps({ query }) {
        return { articles: query.articles || [] };
    }

    render() {
        const { articles } = this.props;
        return (
            <Layout>
                <Container>
                    <Head>
                        <BrandMobile>
                            <Tag>{"<Leodots />"}</Tag>
                        </BrandMobile>
                    </Head>

                    <div>
                        <List>
                            <BrandPC>
                                <Shell>$ </Shell>
                                <Command>ls</Command>
                            </BrandPC>

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
