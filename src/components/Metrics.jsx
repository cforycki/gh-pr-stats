import { Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { METRICS } from "../core/metrics.js";
import { metricsState } from "../state.js";
import { Checkbox } from "./ui/checkbox.jsx";

export const Metrics = () => {
  const [selected, setSelected] = useAtom(metricsState);

  const toggle = (key, checked) =>
    setSelected((previous) => (checked ? [...previous, key] : previous.filter((k) => k !== key)));

  // Not wrapped in `Field`: that injects a single shared input id into context,
  // which all checkboxes would adopt — making every label toggle the first one.
  return (
    <Flex flexDirection="column" gap={2}>
      <Text textStyle="sm" fontWeight="medium">
        Metrics to show
      </Text>
      <Flex flexDirection="column" gap={1}>
        {METRICS.map(({ key, label }) => (
          <Checkbox key={key} checked={selected.includes(key)} onCheckedChange={(e) => toggle(key, !!e.checked)}>
            {label}
          </Checkbox>
        ))}
      </Flex>
    </Flex>
  );
};
