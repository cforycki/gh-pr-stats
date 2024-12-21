import { Card, Collapsible, Heading, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

export const CardCollapsible = ({ title, content }) => {
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
