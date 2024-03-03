import {
	ListItem,
	ListItemIcon,
	ListItemText,
	IconButton,
	Tooltip,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AdjustIcon from "@mui/icons-material/Adjust";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import styles from "../styles/Home.module.css";

export default function Issue({ issue }) {
	const { title, url, createdAt, state } = issue;

	function formatTimeAgo(timestamp) {
		const now = new Date();
		const targetDate = new Date(timestamp);
		const timeDifference = now - targetDate;

		const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
		const weeksAgo = Math.floor(daysAgo / 7);

		if (daysAgo < 7) {
			return `${daysAgo === 1 ? "1 day" : `${daysAgo} days`} ago`;
		} else if (daysAgo < 30) {
			return `${weeksAgo === 1 ? "1 week" : `${weeksAgo} weeks`} ago`;
		} else {
			const formattedDate = targetDate.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});
			return formattedDate;
		}
	}

	return (
		<ListItem
			key={url}
			secondaryAction={
				<IconButton
					edge="end"
					aria-label="View Issue"
					target="_blank"
					href={url}
				>
					<OpenInNewIcon />
				</IconButton>
			}
			size="small"
		>
			<ListItemIcon>
				{state !== "OPEN" ? (
					<Tooltip title="Open">
						<CheckCircleIcon
							className={styles.custom_CheckCircleIcon}
						/>
					</Tooltip>
				) : (
					<Tooltip title="Closed">
						<AdjustIcon className={styles.custom_AdjustIcon} />
					</Tooltip>
				)}
			</ListItemIcon>
			<ListItemText
				primary={title}
				secondary={formatTimeAgo(createdAt)}
			/>
		</ListItem>
	);
}
