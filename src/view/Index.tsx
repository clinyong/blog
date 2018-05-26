import * as React from "react";
import Layout from "../component/Layout";
import List, { Article } from "../component/List";

export interface IndexProps {
    articles: Article[];
}

export default class Index extends React.PureComponent<IndexProps, {}> {
    render() {
        const { articles } = this.props;
        return (
            <Layout>
                <List list={articles} />
            </Layout>
        );
    }
}
