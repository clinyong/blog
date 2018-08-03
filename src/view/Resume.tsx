import * as React from "react";
import styled, { injectGlobal } from "styled-components";
import showdown from "showdown";

const converter = new showdown.Converter();

injectGlobal`
html,
body {
  margin: 0;
}

body {
  margin: 0 10px;
  font-family: Times New Roman, Heiti SC, sans-serif;
}

li {
  line-height: 1.8;
}

h2,
ul {
  margin: 15px 0;
}

h3 {
  margin: 20px 0;
}

h4,
p {
  margin: 5px 0;
}

h3 {
  font-size: 20px;
}

h4 {
  font-size: 18px;
}

p {
  margin-bottom: 15px;
  padding-left: 20px;
  line-height: 1.8;
}

p:last-child {
  margin-bottom: 0;
}
`;

const Container = styled.div`
    width: 800px;
    margin: 0 auto;
    background-color: #fff;
    padding: 20px 40px;
    box-sizing: border-box;
`;

interface ResumeProps {
    content: string;
}

export default class Resume extends React.PureComponent<ResumeProps, {}> {
    render() {
        let content = converter.makeHtml(this.props.content);

        return <Container dangerouslySetInnerHTML={{ __html: content }} />;
    }
}
