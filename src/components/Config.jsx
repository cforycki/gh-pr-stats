import { Collapsible, Flex, HStack, Heading, Input, Spacer, Stack, Textarea } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { LuChevronDown, LuChevronUp, LuInfo } from "react-icons/lu";
import {
  apiKeyState,
  configOpenState,
  endDateState,
  organizationState,
  repositoriesState,
  startDateState,
} from "../state.js";
import { Field } from "./ui/field.jsx";
import { PasswordInput } from "./ui/password-input.jsx";
import { Tooltip } from "./ui/tooltip.jsx";

export const Config = () => {
  const [APIKey, setAPIKey] = useAtom(apiKeyState);
  const [organization, setOrganization] = useAtom(organizationState);
  const [open, setOpen] = useAtom(configOpenState);
  const [startDate, setStartDate] = useAtom(startDateState);
  const [repositories, setRepositories] = useAtom(repositoriesState);
  const [endDate, setEndDate] = useAtom(endDateState);
  return (
    <Collapsible.Root onOpenChange={({ open }) => setOpen(open)} open={open}>
      <Flex flexDirection="column" gap={4}>
        <Collapsible.Trigger>
          <HStack flex={1}>
            <Heading size="md">Config</Heading>
            <Spacer />
            {open ? <LuChevronUp /> : <LuChevronDown />}
          </HStack>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Stack gap={4}>
            <Field
              label={
                <>
                  API Key{" "}
                  <Tooltip
                    content={"Rights: read:enterprise, read:org, read:user, repo, user:email"}
                    openDelay={0}
                    placement={"top"}
                    showArrow={true}
                    positioning={{ placement: "right-start" }}
                  >
                    <LuInfo />
                  </Tooltip>
                </>
              }
            >
              <PasswordInput value={APIKey} onChange={(e) => setAPIKey(e.target.value)} placeholder="API Key" />
            </Field>
            <Field label="Organization">
              <Input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization"
              />
            </Field>
            <Field
              label={
                <>
                  Repositories{" "}
                  <Tooltip
                    content={"Separated by colon or space"}
                    openDelay={0}
                    placement={"top"}
                    showArrow={true}
                    positioning={{ placement: "right-start" }}
                  >
                    <LuInfo />
                  </Tooltip>
                </>
              }
            >
              <Textarea
                value={repositories}
                onChange={(e) => setRepositories(e.target.value)}
                placeholder="Repositories"
              />
            </Field>
            <HStack>
              <Field label="From">
                <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start date" />
              </Field>
              <Field label="To">
                <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End date" />
              </Field>
            </HStack>
          </Stack>
        </Collapsible.Content>
      </Flex>
    </Collapsible.Root>
  );
};
