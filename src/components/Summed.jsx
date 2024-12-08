import { useAtom } from "jotai";
import { summedState } from "../state.js";
import { Checkbox } from "./ui/checkbox.jsx";
import { Field } from "./ui/field.jsx";

export const Summed = () => {
  const [value, setValue] = useAtom(summedState);

  return (
    <Field label="Sort by">
      <Checkbox checked={value} onCheckedChange={(e) => setValue(!!e.checked)}>
        Sum all contributions
      </Checkbox>
    </Field>
  );
};
