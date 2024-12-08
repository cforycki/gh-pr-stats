import { GraphQLClient } from "graphql-request";

const buildRepoRequest = (organization, repository, cursor) => `
  query {
    organization(login: "${organization}") {
      repository(name: "${repository}") {
        pullRequests(${cursor ? `before: "${cursor}" ,` : ""}last: 100) {
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          } 
          nodes {
            createdAt
            permalink
            author {
              login
            }
            comments(first: 30) {
              nodes {
                author {
                  login
                }
                body
              }
            }
            reviews(first: 100) {
              nodes {
                state
                author {
                  login
                }
                body
                comments(first: 20){
                  nodes {
                    body
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const fetchData = async ({ apiKey, organization, repositories, startDate, endDate }) => {
  const graphQLClient = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      authorization: `bearer ${apiKey}`,
    },
  });

  const startingDate = `${startDate}T00:00:00Z`;
  const endingDate = `${endDate}T23:59:59Z`;

  const result = {};
  for (const repository of repositories) {
    let hasPrevious = false;
    let cursor = undefined;
    let nodes = [];
    do {
      const response = await graphQLClient.request(buildRepoRequest(organization, repository, cursor));
      const { pageInfo, nodes: rawNodes } = response.organization.repository.pullRequests;
      nodes = [...nodes, ...rawNodes.filter((node) => node.createdAt >= startingDate && node.createdAt <= endingDate)];

      const oldestPr = rawNodes
        .map((node) => node.createdAt)
        .sort()
        .reverse()
        .pop();
      if (oldestPr && oldestPr > startingDate) {
        hasPrevious = pageInfo.hasPreviousPage;
        cursor = pageInfo.startCursor;
      } else {
        hasPrevious = false;
        cursor = undefined;
      }
    } while (hasPrevious);

    result[repository] = nodes;
  }
  return result;
};
