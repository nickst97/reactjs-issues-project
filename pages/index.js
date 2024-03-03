import { useState, useEffect } from "react";
import {
	GET_REACTJS_ISSUES,
	GET_REACTJS_TOTAL_ISSUES,
} from "../graphqlQueries";
import {
	CircularProgress,
	List,
	Pagination,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
} from "@mui/material";
import { client } from "../client";
import { useRouter } from "next/router";
import Issue from "../components/Issue";
import styles from "../styles/Home.module.css";
import {
	MAX_RECORDS_TO_REQUEST,
	ISSUES_PER_PAGE,
	MAX_PAGES_TO_PRELOAD,
	DEFAULT_ISSUE_STATE,
} from "../config";

export async function getServerSideProps(context) {
	const initialIssueState = context.query.issueState || DEFAULT_ISSUE_STATE;
	if (!["OPEN", "CLOSED"].includes(initialIssueState)) {
		context.res.writeHead(302, { Location: "/" });
		context.res.end();
		return { props: {} };
	}

	const { data: issuesDataStart } = await client.query({
		query: GET_REACTJS_ISSUES,
		variables: {
			first: MAX_RECORDS_TO_REQUEST,
			last: null,
			startCursor: null,
			endCursor: null,
			states: initialIssueState,
		},
	});

	const { data: totalIssuesData } = await client.query({
		query: GET_REACTJS_TOTAL_ISSUES,
		variables: {
			states: initialIssueState,
		},
	});

	const issuesDataEndTotal =
		(MAX_PAGES_TO_PRELOAD - 1) * ISSUES_PER_PAGE +
		(totalIssuesData.repository.issues.totalCount % ISSUES_PER_PAGE);

	const { data: issuesDataEnd } = await client.query({
		query: GET_REACTJS_ISSUES,
		variables: {
			first: null,
			last: issuesDataEndTotal,
			startCursor: null,
			endCursor: null,
			states: initialIssueState,
		},
	});

	return {
		props: {
			issuesDataStart,
			issuesDataEnd,
			totalIssuesData,
			initialIssueState,
			issuesDataEndTotal,
		},
	};
}

export default function Home({
	issuesDataStart,
	issuesDataEnd,
	totalIssuesData,
	initialIssueState,
	issuesDataEndTotal,
}) {
	const router = useRouter();
	const [issueState, setIssueState] = useState(initialIssueState);
	const [totalIssues, setTotalIssues] = useState({
		[issueState]: totalIssuesData.repository.issues.totalCount,
	});
	const [totalPages, setTotalPages] = useState({
		[issueState]: Math.ceil(totalIssues[issueState] / ISSUES_PER_PAGE),
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [cursors, setCursors] = useState({
		start: issuesDataEnd.repository.issues.pageInfo.startCursor,
		end: issuesDataStart.repository.issues.pageInfo.endCursor,
	});
	const [issues, setIssues] = useState({
		[issueState]: issuesToChunks(
			issuesDataStart,
			issuesDataEnd,
			totalPages[issueState],
			issuesDataEndTotal
		),
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (!Object.keys(totalIssues).includes(issueState)) {
					const { data: newIssuesDataStart } = await client.query({
						query: GET_REACTJS_ISSUES,
						variables: {
							first: MAX_RECORDS_TO_REQUEST,
							last: null,
							startCursor: null,
							endCursor: null,
							states: issueState,
						},
					});

					const { data: newTotalIssuesData } = await client.query({
						query: GET_REACTJS_TOTAL_ISSUES,
						variables: {
							states: issueState,
						},
					});

					const newIssuesDataEndTotal =
						(MAX_PAGES_TO_PRELOAD - 1) * ISSUES_PER_PAGE +
						(newTotalIssuesData.repository.issues.totalCount %
							ISSUES_PER_PAGE);

					const { data: newIssuesDataEnd } = await client.query({
						query: GET_REACTJS_ISSUES,
						variables: {
							first: null,
							last: newIssuesDataEndTotal,
							startCursor: null,
							endCursor: null,
							states: issueState,
						},
					});

					setTotalIssues({
						...totalIssues,
						[issueState]:
							newTotalIssuesData.repository.issues.totalCount,
					});
					const currentIssueStateTotalPages = Math.ceil(
						newTotalIssuesData.repository.issues.totalCount /
							ISSUES_PER_PAGE
					);
					setTotalPages({
						...totalPages,
						[issueState]: currentIssueStateTotalPages,
					});

					setIssues({
						...issues,
						[issueState]: issuesToChunks(
							newIssuesDataStart,
							newIssuesDataEnd,
							currentIssueStateTotalPages,
							newIssuesDataEndTotal
						),
					});
				}
				setCurrentPage(1);
			} catch (error) {
				console.error("Error fetching data:", error);
				window.location.reload(true);
				window.location.href = "/";
			}
		};
		if (issueState !== DEFAULT_ISSUE_STATE) {
			fetchData();
		}
	}, [issueState]);

	useEffect(() => {
		const fetchData = async () => {
			if (
				!Object.keys(issues[issueState]).includes(
					currentPage.toString()
				)
			) {
				if (
					Object.keys(issues[issueState]).includes(
						(currentPage - 1).toString()
					) &&
					currentPage - 1 > 1
				) {
					await loadIssues("next", currentPage);
				} else if (
					Object.keys(issues[issueState]).includes(
						(currentPage + 1).toString()
					) &&
					currentPage + 1 <= totalPages[issueState]
				) {
					await loadIssues("previous", currentPage);
				}
			} else if (
				!Object.keys(issues[issueState]).includes(
					(currentPage + 1).toString()
				) &&
				currentPage + 1 <= totalPages[issueState]
			) {
				await loadIssues("next", currentPage + 1);
			} else if (
				!Object.keys(issues[issueState]).includes(
					(currentPage - 1).toString()
				) &&
				currentPage - 1 > 1
			) {
				await loadIssues("previous", currentPage - 1);
			}
		};
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		fetchData();
	}, [currentPage]);

	function issuesToChunks(
		issuesDataStart,
		issuesDataEnd,
		totalPages,
		issuesDataEndTotal
	) {
		const newIssues = {};

		for (let i = 1; i <= MAX_PAGES_TO_PRELOAD; i++) {
			newIssues[i] = issuesDataStart.repository.issues.nodes.slice(
				(i - 1) * ISSUES_PER_PAGE,
				i * ISSUES_PER_PAGE
			);
		}

		for (let i = totalPages; i > totalPages - MAX_PAGES_TO_PRELOAD; i--) {
			if (i === totalPages) {
				newIssues[i] = issuesDataEnd.repository.issues.nodes.slice(
					-issuesDataEndTotal % ISSUES_PER_PAGE
				);
			} else {
				newIssues[i] = issuesDataEnd.repository.issues.nodes.slice(
					(i - (totalPages - MAX_PAGES_TO_PRELOAD) - 1) *
						ISSUES_PER_PAGE,
					(i - (totalPages - MAX_PAGES_TO_PRELOAD)) * ISSUES_PER_PAGE
				);
			}
		}

		return newIssues;
	}

	async function loadIssues(direction, page, newIssueState = issueState) {
		const { data: newIssuesData } = await client.query({
			query: GET_REACTJS_ISSUES,
			variables: {
				first: direction === "next" ? ISSUES_PER_PAGE : null,
				last: direction === "previous" ? ISSUES_PER_PAGE : null,
				startCursor:
					direction === "previous" && newIssueState === issueState
						? cursors.start
						: null,
				endCursor:
					direction === "next" && newIssueState === issueState
						? cursors.end
						: null,
				states: newIssueState,
			},
		});

		setIssues({
			...issues,
			[newIssueState]: {
				...issues[newIssueState],
				[page]: newIssuesData.repository.issues.nodes,
			},
		});

		if (direction === "next") {
			setCursors({
				...cursors,
				end: newIssuesData.repository.issues.pageInfo.endCursor,
			});
		} else {
			setCursors({
				...cursors,
				start: newIssuesData.repository.issues.pageInfo.startCursor,
			});
		}
	}

	const handleIssueStateChange = (_, newIssueState) => {
		if (newIssueState !== issueState && newIssueState !== null) {
			router.push({
				pathname: "/",
				query: { issueState: newIssueState },
			});
			setIssueState(newIssueState);
		} else {
			setCurrentPage(1);
		}
	};

	return (
		<main>
			<div className={styles.top_container}>
				<Typography variant="h4">Issues</Typography>
				<ToggleButtonGroup
					color="primary"
					value={issueState}
					exclusive
					onChange={handleIssueStateChange}
					aria-label="Issues States"
					size="small"
				>
					<ToggleButton value="OPEN">Open</ToggleButton>
					<ToggleButton value="CLOSED">Closed</ToggleButton>
				</ToggleButtonGroup>
			</div>
			<div className={styles.list_container}>
				<List>
					{issues[issueState] &&
					Object.keys(issues[issueState]).includes(
						currentPage.toString()
					) ? (
						issues[issueState][currentPage].map((issue) => (
							<Issue key={issue.url} issue={issue} />
						))
					) : (
						<div className={styles.loading_container}>
							<CircularProgress />
						</div>
					)}
				</List>
				<div className={styles.pagination_container}>
					<Pagination
						page={currentPage || 1}
						color="primary"
						count={totalPages[issueState] || 1}
						shape="rounded"
						onChange={(_, page) => setCurrentPage(page)}
					/>
				</div>
			</div>
		</main>
	);
}
