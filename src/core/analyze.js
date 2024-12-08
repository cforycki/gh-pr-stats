const initRepositoriesData = (repositories = []) =>
  repositories.reduce((acc, r) => {
    acc[r] = { created: 0, approved: 0, requestedChanges: 0, comments: 0 };
    return acc;
  }, {});

const initUserData = (repositories) => ({
  repositories: initRepositoriesData(repositories),
  total: { created: 0, approved: 0, requestedChanges: 0, comments: 0 },
});

export const analyze = async ({ data, repositories, users = [] }) => {
  const dataByUsers = {};
  for (const repository of repositories) {
    const rawData = data[repository];

    for (const pullRequest of rawData) {
      const {
        comments: { nodes: comments },
        reviews: { nodes: reviews },
        author: { login: prAuthor },
      } = pullRequest;

      if (users.length > 0 && !users.includes(prAuthor)) {
        continue;
      }

      if (!dataByUsers[prAuthor]) {
        dataByUsers[prAuthor] = initUserData(repositories);
      }

      dataByUsers[prAuthor].total.created++;
      dataByUsers[prAuthor].repositories[repository].created++;

      for (const comment of comments) {
        const commentAuthor = comment.author.login;
        if (users.length > 0 && !users.includes(commentAuthor)) {
          continue;
        }

        if (!dataByUsers[commentAuthor]) {
          dataByUsers[commentAuthor] = initUserData(repositories);
        }

        dataByUsers[commentAuthor].total.comments++;
        dataByUsers[commentAuthor].repositories[repository].comments++;
      }

      for (const review of reviews) {
        const reviewAuthor = review.author.login;
        if (users.length > 0 && !users.includes(reviewAuthor)) {
          continue;
        }

        if (!dataByUsers[reviewAuthor]) {
          dataByUsers[reviewAuthor] = initUserData(repositories);
        }

        if (review.state === "APPROVED") {
          dataByUsers[reviewAuthor].total.approved++;
          dataByUsers[reviewAuthor].repositories[repository].approved++;
        }

        if (review.state === "COMMENTED" || review.body?.length || review.comments?.nodes?.length) {
          dataByUsers[reviewAuthor].total.comments++;
          dataByUsers[reviewAuthor].repositories[repository].comments++;
        }

        if (
          review.state === "CHANGES_REQUESTED" ||
          (review.state === "DISMISSED" &&
            reviews.some((r) => r.author.login === reviewAuthor && r.state === "APPROVED"))
        ) {
          dataByUsers[reviewAuthor].total.requestedChanges++;
          dataByUsers[reviewAuthor].repositories[repository].requestedChanges++;
        }
      }
    }
  }

  return dataByUsers;
};
