import { createListCollection } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { METRICS } from "../core/metrics.js";
import { sortState } from "../state.js";
import { Field } from "./ui/field.jsx";
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText } from "./ui/select.jsx";

const options = createListCollection({
  items: [
    { label: "Total of shown metrics", value: "contributions" },
    { label: "Total contributions", value: "totalContributions" },
    ...METRICS.map(({ key, label }) => ({ label, value: key })),
  ],
});

export const Sorting = () => {
  const [value, setValue] = useAtom(sortState);

  return (
    <Field label="Sort by">
      <SelectRoot collection={options} value={[value]} onValueChange={(e) => setValue(e.value[0])}>
        <SelectTrigger clearable={true}>
          <SelectValueText placeholder="Select sorting option" />
        </SelectTrigger>
        <SelectContent>
          {options.items.map((sort) => (
            <SelectItem item={sort} key={sort.value}>
              {sort.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Field>
  );
};
