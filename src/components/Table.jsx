import { Table as ChakraTable, Link } from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";

export const Table = ({ table }) => {
  return (
    <ChakraTable.Root>
      <ChakraTable.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <ChakraTable.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <ChakraTable.ColumnHeader key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </ChakraTable.ColumnHeader>
            ))}
          </ChakraTable.Row>
        ))}
      </ChakraTable.Header>
      <ChakraTable.Body>
        {table.getRowModel().rows.map((row) => (
          <ChakraTable.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <ChakraTable.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </ChakraTable.Cell>
            ))}
          </ChakraTable.Row>
        ))}
      </ChakraTable.Body>
    </ChakraTable.Root>
  );
};
