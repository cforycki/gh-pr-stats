import { Stack, Tabs } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { LuGithub, LuSigma, LuUser } from "react-icons/lu";
import { METRIC_KEYS } from "../core/metrics.js";
import { dataState, ignoreUsersState, metricsState, rawDataState, sortState, teamMembersState } from "../state.js";
import { CardCollapsible } from "./CardCollapsible.jsx";
import { ChartBase } from "./ChartBase.jsx";
import { UserContributions } from "./UserContributions.jsx";

/**
 * @typedef {name: string, comments:number, approved: number, requestedChanges:number, comments: number } ChartValue
 */

/**
 *
 * @param {(rawData: any) => ChartValue[]}factory
 * @returns {*}
 */
const useData = (factory) => {
  const rawData = useAtomValue(dataState);
  const sort = useAtomValue(sortState);
  const ignoreUsers = useAtomValue(ignoreUsersState);
  const metrics = useAtomValue(metricsState);
  return useMemo(() => {
    let arr = factory(rawData)
      .filter(({ name }) => !ignoreUsers.split(/[,; ]/).includes(name))
      .map(({ name, ...contributions }) => ({
        name,
        ...contributions,
        // Only sum the metrics the user opted into, so noisy ones (e.g. comments)
        // can be excluded from the total.
        contributions: metrics.reduce((total, key) => total + (contributions[key] ?? 0), 0),
        // Sum of every metric, independent of the picker, for the "Total
        // contributions" sort.
        totalContributions: METRIC_KEYS.reduce((total, key) => total + (contributions[key] ?? 0), 0),
      }));
    if (sort) {
      arr = arr.sort((a, b) => {
        return b[sort] - a[sort];
      });
    }
    return arr;
  }, [rawData, sort, factory, ignoreUsers, metrics]);
};

const ChartGlobal = () => {
  const data = useData(
    useCallback(
      (rawData) =>
        Object.keys(rawData).reduce((acc, key) => {
          acc.push({
            name: key,
            ...rawData[key].total,
          });
          return acc;
        }, []),
      [],
    ),
  );
  return <ChartBase chartData={data} />;
};

const ChartUser = ({ user }) => {
  const data = useData(
    useCallback(
      (rawData) =>
        Object.keys(rawData[user].repositories).reduce((acc, repository) => {
          acc.push({
            name: repository,
            ...rawData[user].repositories[repository],
          });
          return acc;
        }, []),
      [user],
    ),
  );

  return <ChartBase chartData={data} />;
};

const ChartRepository = ({ repository }) => {
  const data = useData(
    useCallback(
      (rawData) =>
        Object.keys(rawData).reduce((acc, key) => {
          acc.push({
            name: key,
            ...rawData[key].repositories[repository],
          });
          return acc;
        }, []),
      [repository],
    ),
  );

  return <ChartBase chartData={data} />;
};

export const Data = () => {
  const data = useAtomValue(dataState);
  const ignoreUsers = useAtomValue(ignoreUsersState);
  const users = Object.keys(data).filter((k) => !ignoreUsers.split(/[,; ]/).includes(k));
  const repositories = [
    ...new Set(Object.keys(data).reduce((acc, user) => Object.keys(data[user].repositories), [])).keys(),
  ];

  const rawData = useAtomValue(rawDataState);
  const teamMembers = useAtomValue(teamMembersState);
  const rawContributions = useMemo(
    () =>
      (Object.entries(rawData) ?? [])?.flatMap(([repository, rawData]) => {
        return rawData.map((item) => {
          const author = item.author.login;
          const slug = item.permalink.split("/").pop();
          const link = item.permalink;
          const title = item.title;

          const reviewedLogins = item.reviews.nodes
            .filter((r) => r.author.login !== author)
            .map((r) => r.author.login);
          const directRequestedLogins = item.reviewRequests.nodes
            .map((rr) => rr.requestedReviewer?.login)
            .filter(Boolean);
          const reviewRequested = [...new Set([...reviewedLogins, ...directRequestedLogins])];

          const reviewRequestedViaTeam = [
            ...new Set(
              item.reviewRequests.nodes.flatMap((rr) => {
                const slug = rr.requestedReviewer?.slug;
                return slug && teamMembers[slug] ? teamMembers[slug] : [];
              }),
            ),
          ].filter((login) => login !== author);

          return {
            author,
            link,
            slug,
            repository,
            title,
            comments: [
              ...item.comments.nodes.map(({ author: { login }, body }) => ({ author: login, body })),
              ...item.reviews.nodes
                .filter((node) => ["COMMENTED", "APPROVED"].includes(node.state))
                .flatMap(({ author: { login }, body, comments }) => [
                  ...(body ? [{ author: login, body }] : []),
                  ...comments.nodes.map((comment) => ({ author: login, body: comment.body })),
                ]),
            ].filter((k) => !ignoreUsers.split(/[,; ]/).includes(k.author)),
            approvals: item.reviews.nodes
              .filter((node) => node.state === "APPROVED")
              .map(({ author: { login }, body }) => ({ author: login, body })),
            requestedChanges: item.reviews.nodes
              .filter((node) => ["CHANGES_REQUESTED", "DISMISSED"].includes(node.state))
              .flatMap(({ author: { login }, body, comments }) => [
                ...(body ? [{ author: login, body }] : []),
                ...comments.nodes.map((comment) => ({ author: login, body: comment.body })),
              ]),
            reviewRequested,
            reviewRequestedViaTeam,
          };
        });
      }),
    [rawData, teamMembers],
  );

  return (
    <Tabs.Root defaultValue="global" size={"lg"} fitted={true}>
      <Tabs.List position={"sticky"} top={0} zIndex={1} background={"bg"}>
        <Tabs.Trigger value="global">
          <LuSigma />
          Global
        </Tabs.Trigger>
        <Tabs.Trigger value="users">
          <LuUser />
          By users
        </Tabs.Trigger>
        <Tabs.Trigger value="repositories">
          <LuGithub />
          By repositories
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content p={4} value="global">
        <ChartGlobal />
      </Tabs.Content>
      <Tabs.Content p={4} value="users">
        <Stack gap={4}>
          {users.map((user) => (
            <CardCollapsible
              title={user}
              content={
                <>
                  <ChartUser user={user} />
                  <UserContributions user={user} rawContributions={rawContributions} />
                </>
              }
              key={user}
            />
          ))}
        </Stack>
      </Tabs.Content>
      <Tabs.Content p={4} value="repositories">
        <Stack gap={4}>
          {repositories.map((repository) => (
            <CardCollapsible
              title={repository}
              content={<ChartRepository repository={repository} />}
              key={repository}
            />
          ))}
        </Stack>
      </Tabs.Content>
    </Tabs.Root>
  );
};
