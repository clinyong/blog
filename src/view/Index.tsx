import * as React from "react";
import styled from "styled-components";
import Layout from "../component/Layout";
import List, { Article } from "../component/List";

const Container = styled.div`
    @media screen and (min-width: 770px) {
        width: 650px;
        margin: 0 auto;
    }
`;

interface IndexProps {
    articles: Article[];
}

export default class Index extends React.PureComponent<IndexProps, {}> {
    render() {
        const { articles } = this.props;
        return (
            <Layout>
                <Container>
                    <List list={articles} />
                </Container>
            </Layout>
        );
    }
}
