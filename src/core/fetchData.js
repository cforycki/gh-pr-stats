import { GraphQLClient } from "graphql-request";

const buildTeamMembersRequest = (organization, teamSlug) => `
  query {
    organization(login: "${organization}") {
      team(slug: "${teamSlug}") {
        members(first: 100) {
          nodes {
            login
          }
        }
      }
    }
  }
`;

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
            title
            author {
              login
            }
            comments(first: 50) {
              nodes {
                author {
                  login
                }
                body
              }
            }
            reviews(first: 20) {
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
            reviewRequests(first: 20) {
              nodes {
                requestedReviewer {
                  ... on User {
                    login
                  }
                  ... on Team {
                    slug
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

  const teamSlugs = new Set();
  for (const nodes of Object.values(result)) {
    for (const pr of nodes) {
      for (const rr of pr.reviewRequests.nodes) {
        if (rr.requestedReviewer?.slug) {
          teamSlugs.add(rr.requestedReviewer.slug);
        }
      }
    }
  }

  const teamMembers = {};
  for (const slug of teamSlugs) {
    const response = await graphQLClient.request(buildTeamMembersRequest(organization, slug));
    teamMembers[slug] = response.organization.team.members.nodes.map((n) => n.login);
  }

  return { data: result, teamMembers };
};
