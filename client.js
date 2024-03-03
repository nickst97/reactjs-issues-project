import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
	uri: "https://api.github.com/graphql",
});

const authLink = setContext((_, { headers }) => {
	const token = process.env.GITHUB_TOKEN;
	return {
		headers: {
			...headers,
			authorization: `Bearer ${token}`,
		},
	};
});

const cache = new InMemoryCache({
	typePolicies: {
		Query: {
			fields: {
				repository: {
					merge(existing = {}, incoming) {
						// Define your custom merge logic here
						return {
							...existing,
							...incoming,
						};
					},
				},
			},
		},
	},
});

export const client = new ApolloClient({
	cache,
	link: authLink.concat(httpLink),
});
