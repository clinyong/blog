import * as React from "react";
import styled from "../../../cubi/node_modules/styled-components";

const Container = styled.div`position: relative;`;
const Content = styled.div`
	@media screen and (min-width: 770px) {
		padding: 40px 0 100px;
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
		color: #108ee9 !important;
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
				<Content>{this.props.children}</Content>
				<Footer>
					<Coding>
						Hosted by{" "}
						<a href="https://pages.coding.me">Coding Pages</a>
					</Coding>
				</Footer>
			</Container>
		);
	}
}
