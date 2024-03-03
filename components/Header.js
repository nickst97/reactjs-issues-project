import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
	return (
		<AppBar position="static">
			<Toolbar>
				<Typography
					variant="h5"
					component="a"
					href="/"
					style={{ color: "white" }}
				>
					ReactJS Issues Tracker
				</Typography>
			</Toolbar>
		</AppBar>
	);
};

export default Header;
