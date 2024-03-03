import { Typography, Link } from "@mui/material";

const Footer = () => {
	return (
		<footer>
			<Typography variant="body2" color="textSecondary" align="center">
				Built by{" "}
				<Link
					href="https://nickst97.dev/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Nikolas Stavrakakis
				</Link>
				.
				<br />
				ReactJS issues provided by{" "}
				<Link
					href="https://github.com/reactjs/reactjs.org/issues"
					target="_blank"
					rel="noopener noreferrer"
				>
					react.dev
				</Link>
			</Typography>
		</footer>
	);
};

export default Footer;
