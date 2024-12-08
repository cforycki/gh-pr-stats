import { Card, Collapsible, Heading, Spacer, Stack, Tabs } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp, LuGithub, LuSigma, LuUser } from "react-icons/lu";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dataState, sortState, summedState } from "../state.js";

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

const ChartBase = ({ chartData }) => {
  const summed = useAtomValue(summedState);
  return (
    <ResponsiveContainer width="100%" height={600}>
      <BarChart
        width={500}
        height={600}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={"name"} />
        <YAxis />
        <Tooltip labelStyle={{ color: "#666" }} cursor={{ fill: "var(--chakra-colors-gray-muted)", opacity: 0.65 }} />
        <Legend />

        {summed && <Bar dataKey="contributions" name="Contributions" fill={"#7eb0d5"} />}

        {!summed && <Bar dataKey="created" name="Created" fill={"#7eb0d5"} />}
        {!summed && <Bar dataKey="approved" name="Approved" fill={"#b2e061"} />}
        {!summed && <Bar dataKey="requestedChanges" name="Requested changes" fill={"#bd7ebe"} />}
        {!summed && <Bar dataKey="comments" name="Comments" fill={"#8bd3c7"} />}
      </BarChart>
    </ResponsiveContainer>
  );
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

const CardCollapsible = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
      <Card.Root>
        <Collapsible.Trigger>
          <Card.Header pb={6} flexDirection="row" alignItems="center">
            <Heading size="md">{title}</Heading>
            <Spacer />
            {open ? <LuChevronUp /> : <LuChevronDown />}
          </Card.Header>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Card.Body pt={0}>{content}</Card.Body>
        </Collapsible.Content>
      </Card.Root>
    </Collapsible.Root>
  );
};

export const Data = () => {
  const data = useAtomValue(dataState);
  const users = Object.keys(data).filter((k) => k !== "linear" && k !== "dependabot");
  const repositories = [
    ...new Set(Object.keys(data).reduce((acc, user) => Object.keys(data[user].repositories), [])).keys(),
  ];

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
            <CardCollapsible title={user} content={<ChartUser user={user} />} key={user} />
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
