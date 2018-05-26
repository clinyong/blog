import * as React from "react";
import Layout from "../component/Layout";
import List from "../component/List";
import { IndexProps } from "./Index";

export default class Archive extends React.PureComponent<IndexProps, {}> {
    render() {
        const { articles } = this.props;
        return (
            <Layout>
                <List list={articles} showSearch />
            </Layout>
        );
    }
}
