import {Textarea} from "@chakra-ui/react";
import {useAtom} from "jotai";
import {ignoreUsersState} from "../state.js";
import {Field} from "./ui/field.jsx";

export const IgnoreUsers = () => {
  const [ignoreUsers, setIgnoreUsers] = useAtom(ignoreUsersState);
  return (
    <Field label="Ignore users">
        <Textarea
          value={ignoreUsers}
          onChange={(e) => setIgnoreUsers(e.target.value)}
          placeholder="Users to ignore (separated by colon or space)"
        />
    </Field>
  );
}