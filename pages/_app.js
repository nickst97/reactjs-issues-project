import "../styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Head from "next/head";

const theme = createTheme({
	palette: {
		primary: {
			main: "#5C8AB9",
		},
		secondary: {
			main: "#C95752",
		},
	},
	typography: {
		fontFamily: ["Montserrat", "sans-serif"].join(","),
	},
	"& .MuiPaginationItem-root": {
		height: "1.8rem",
		width: "1.8rem",
	},
});

function MyApp({ Component, pageProps }) {
	return (
		<ThemeProvider theme={theme}>
			<Head>
				<meta charSet="utf-8" />
				<meta name="theme-color" content="#5C8AB9" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<title>ReactJS issues</title>
			</Head>
			<Header />
			<Component {...pageProps} />
			<Footer />
		</ThemeProvider>
	);
}

export default MyApp;
