import { Box, Collapsible, Flex, Heading, Link, Spacer } from "@chakra-ui/react";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { Table } from "./Table.jsx";

const columnHelper = createColumnHelper();
const baseColumns = [
  columnHelper.accessor("repository", {
    header: "repository",
  }),
  columnHelper.accessor("author", {
    header: "Author",
    cell: (info) => (
      <Link target={"_blank"} href={`https://github.com/${info.getValue()}`}>
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("link", {
    cell: (info) => (
      <Link target={"_blank"} href={info.getValue()}>
        #{info.row.original.slug}
      </Link>
    ),
    header: "Link",
  }),
  columnHelper.accessor("title", {
    cell: (info) => (
      <Link target={"_blank"} href={info.row.original.link} whiteSpace={"nowrap"}>
        {info.getValue()}
      </Link>
    ),
    header: "Title",
  }),
];

const SectionCollapsible = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
      <Collapsible.Trigger w={"100%"} pt={2}>
        <Flex flexDirection="row" alignItems="center">
          <Heading size="md">{title}</Heading>
          <Spacer />
          {open ? <LuChevronUp /> : <LuChevronDown />}
        </Flex>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Box pt={2}>{content}</Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const CreatedTable = ({ user, rawContributions }) => {
  const columns = [...baseColumns];
  const contributions = useMemo(() => {
    return rawContributions.filter((item) => item.author === user);
  }, [rawContributions, user]);

  const table = useReactTable({
    data: contributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <Table table={table} />;
};
const CommentedTable = ({ user, rawContributions }) => {
  const columns = [
    ...baseColumns,
    columnHelper.accessor("comment", {
      header: "Comment",
    }),
  ];
  const contributions = useMemo(() => {
    return rawContributions.flatMap((item) =>
      item.comments
        .filter((approval) => approval.author === user)
        .map((comment) => ({
          ...item,
          comment: `${comment.body.slice(0, 100)}${comment.body.length > 100 ? "..." : ""}`,
        })),
    );
  }, [rawContributions, user]);

  const table = useReactTable({
    data: contributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <Table table={table} />;
};
const ApprovedTable = ({ user, rawContributions }) => {
  const columns = [...baseColumns];
  const contributions = useMemo(() => {
    return rawContributions.filter((item) => item.approvals.some((approval) => approval.author === user));
  }, [rawContributions, user]);

  const table = useReactTable({
    data: contributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <Table table={table} />;
};
const RequestedChangesTable = ({ user, rawContributions }) => {
  const columns = [...baseColumns];
  const contributions = useMemo(() => {
    return rawContributions.filter((item) => item.requestedChanges.some((approval) => approval.author === user));
  }, [rawContributions, user]);

  const table = useReactTable({
    data: contributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <Table table={table} />;
};

export const UserContributions = ({ user, rawContributions }) => {
  return (
    <Flex flexDirection="column" pt={6} gap={2} divideY={"2px"}>
      <SectionCollapsible title="Created" content={<CreatedTable user={user} rawContributions={rawContributions} />} />
      <SectionCollapsible
        title="Approved"
        content={<ApprovedTable user={user} rawContributions={rawContributions} />}
      />
      <SectionCollapsible
        title="Commented"
        content={<CommentedTable user={user} rawContributions={rawContributions} />}
      />
      <SectionCollapsible
        title="Requested changes"
        content={<RequestedChangesTable user={user} rawContributions={rawContributions} />}
      />
    </Flex>
  );
};
