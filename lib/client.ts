import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";

type MyApolloCache = any;

let apolloClient: ApolloClient<MyApolloCache> | undefined;

function createIsomorphLink() {
  if (typeof window === "undefined") {
    const { SchemaLink } = require("@apollo/client/link/schema");
    const { schema } = require("../backend/schema");
    const { db } = require("../backend/db");
    return new SchemaLink({ schema, context: { db } });
  } else {
    const { HttpLink } = require("@apollo/client/link/http");
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin",
    });
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: MyApolloCache | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: MyApolloCache) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
