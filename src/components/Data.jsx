import { Stack, Tabs } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { LuGithub, LuSigma, LuUser } from "react-icons/lu";
import { dataState, rawDataState, sortState } from "../state.js";
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
  return useMemo(() => {
    let arr = factory(rawData).map(({ name, ...contributions }) => ({
      name,
      ...contributions,
      contributions: Object.values(contributions).reduce((a, b) => a + b),
    }));
    if (sort) {
      arr = arr.sort((a, b) => {
        return b[sort] - a[sort];
      });
    }
    return arr;
  }, [rawData, sort, factory]);
};

const ChartGlobal = () => {
  const data = useData(
    useCallback(
      (rawData) =>
        Object.keys(rawData)
          .filter((k) => k !== "linear" && k !== "dependabot")
          .reduce((acc, key) => {
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
        Object.keys(rawData)
          .filter((k) => k !== "linear" && k !== "dependabot")
          .reduce((acc, key) => {
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
  const users = Object.keys(data).filter((k) => k !== "linear" && k !== "dependabot");
  const repositories = [
    ...new Set(Object.keys(data).reduce((acc, user) => Object.keys(data[user].repositories), [])).keys(),
  ];

  const rawData = useAtomValue(rawDataState);
  const rawContributions = useMemo(
    () =>
      (Object.entries(rawData) ?? [])?.flatMap(([repository, rawData]) => {
        return rawData.map((item) => {
          const author = item.author.login;
          const slug = item.permalink.split("/").pop();
          const link = item.permalink;
          const title = item.title;

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
            ].filter((k) => k.author !== "linear" && k.author !== "dependabot"),
            approvals: item.reviews.nodes
              .filter((node) => node.state === "APPROVED")
              .map(({ author: { login }, body }) => ({ author: login, body })),
            requestedChanges: item.reviews.nodes
              .filter((node) => ["CHANGES_REQUESTED", "DISMISSED"].includes(node.state))
              .flatMap(({ author: { login }, body, comments }) => [
                ...(body ? [{ author: login, body }] : []),
                ...comments.nodes.map((comment) => ({ author: login, body: comment.body })),
              ]),
          };
        });
      }),
    [rawData],
  );

  console.log(rawContributions);

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
