import Document, { Head, Main, NextScript } from "next/document";
import { ServerStyleSheet, injectGlobal } from "styled-components";

injectGlobal`
html {
    position: relative;
    background-color: #ECF0F1;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', 'WenQuanYi Micro Hei',sans-serif;
}

html, body {
    min-height: 100%;
    margin: 0;
    padding: 0;
}
`;

export default class MyDocument extends Document {
	render() {
		const sheet = new ServerStyleSheet();
		const main = sheet.collectStyles(<Main />);
		const styleTags = sheet.getStyleElement();
		return (
			<html lang="zh-Hans">
				<Head>
					<title>Leodots</title>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
					<link
						rel="shortcut icon"
						href="/static/favicon.ico"
						type="image/x-icon"
					/>
					<link
						rel="icon"
						href="/static/favicon.ico"
						type="image/x-icon"
					/>
					{styleTags}
				</Head>
				<body>
					<div>
						{main}
					</div>
					<NextScript />
				</body>
			</html>
		);
	}
}
