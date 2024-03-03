import { gql } from "@apollo/client";

export const GET_REACTJS_ISSUES = gql`
	query GetReactJsIssues(
		$first: Int
		$last: Int
		$startCursor: String
		$endCursor: String
		$states: [IssueState!]
	) {
		repository(owner: "reactjs", name: "reactjs.org") {
			issues(
				first: $first
				last: $last
				before: $startCursor
				after: $endCursor
				states: $states
				orderBy: { field: CREATED_AT, direction: DESC }
			) {
				nodes {
					title
					url
					createdAt
					state
				}
				pageInfo {
					startCursor
					endCursor
					hasNextPage
					hasPreviousPage
				}
			}
		}
	}
`;

export const GET_REACTJS_TOTAL_ISSUES = gql`
	query GetAllReactJsIssues($states: [IssueState!]) {
		repository(owner: "reactjs", name: "reactjs.org") {
			issues(states: $states) {
				totalCount
			}
		}
	}
`;
